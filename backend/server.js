const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const dotenv = require("dotenv");
const https = require("https");
const twilio = require("twilio");

/*
  Load .env before importing AI modules.
*/
dotenv.config();

const {
  analyzeImageReuse,
} = require("./ai/imageReuseDetector");

const {
  analyzeDuplicateComplaint,
} = require("./ai/duplicateDetector");

const {
  verifyEvidenceMatch,
  isEvidenceAiConfigured,
  getEvidenceAiModel,
} = require("./ai/evidenceVerifier");

const {
  connectMongo,
  getDb,
  ensureMongoIndexes,
  closeMongo,
} = require("./db/mongo");

const {
  uploadEvidenceBuffer,
  isCloudinaryConfigured,
} = require("./storage/cloudinary");

const app = express();
const PORT = Number(process.env.PORT || 5000);

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "");

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const adminSessions = new Map();

const CITIZEN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const CITIZEN_REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_SENDS_PER_HOUR = 5;

const citizenSessions = new Map();
const pendingCitizenRegistrations = new Map();
const otpSendHistory = new Map();
const citizenLoginAttempts = new Map();

const BREVO_API_KEY = String(
  process.env.BREVO_API_KEY || ""
).trim();

const EMAIL_FROM = String(
  process.env.EMAIL_FROM || ""
).trim();

const EMAIL_FROM_NAME = String(
  process.env.EMAIL_FROM_NAME || "NagarSwar AI"
).trim();

const TWILIO_ACCOUNT_SID = String(
  process.env.TWILIO_ACCOUNT_SID || ""
).trim();
const TWILIO_AUTH_TOKEN = String(
  process.env.TWILIO_AUTH_TOKEN || ""
).trim();
const TWILIO_FROM_NUMBER = String(
  process.env.TWILIO_FROM_NUMBER || ""
).trim();

app.use(cors());
app.use(express.json());

const complaintsFile = path.join(__dirname, "complaints.json");
const usersFile = path.join(__dirname, "users.json");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/*
  New complaint evidence is kept in memory only.
  It is analyzed and uploaded directly to Cloudinary.
  Nothing new is permanently written to backend/uploads/.

  The legacy /uploads static route remains temporarily so old
  complaints still work until migrateEvidenceToCloudinary.js
  finishes migrating them.
*/

const storage =
  multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG and WebP evidence images are allowed.")
      );
    }

    callback(null, true);
  },
});

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

function hashForComparison(value) {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest();
}

function safeCompare(firstValue, secondValue) {
  return crypto.timingSafeEqual(
    hashForComparison(firstValue),
    hashForComparison(secondValue)
  );
}

function createAdminSession() {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;

  adminSessions.set(token, {
    email: ADMIN_EMAIL,
    expiresAt,
  });

  return { token, expiresAt };
}

function getBearerToken(req) {
  const authorization = req.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

function getValidAdminSession(token) {
  if (!token) {
    return null;
  }

  const session = adminSessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(token);
    return null;
  }

  return session;
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  const session = getValidAdminSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required.",
    });
  }

  req.admin = session;
  req.adminToken = token;
  next();
}

const adminSessionCleanup = setInterval(() => {
  const now = Date.now();

  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}, 30 * 60 * 1000);

adminSessionCleanup.unref();

/* =========================================================
   CITIZEN AUTHENTICATION + OTP
========================================================= */

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+\d{11,15}$/.test(phone);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .scryptSync(String(password), salt, 64)
    .toString("hex");

  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  try {
    const calculatedHash = crypto
      .scryptSync(String(password), salt, 64)
      .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp, registrationId) {
  return crypto
    .createHmac("sha256", registrationId)
    .update(String(otp))
    .digest("hex");
}

function verifyOtpHash(otp, registrationId, expectedHash) {
  try {
    const calculated = hashOtp(otp, registrationId);

    return crypto.timingSafeEqual(
      Buffer.from(calculated, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

function maskEmail(email) {
  const [name, domain] = email.split("@");

  if (!domain) return email;

  const visible =
    name.length <= 2
      ? name[0] || "*"
      : `${name.slice(0, 2)}${"*".repeat(Math.min(6, name.length - 2))}`;

  return `${visible}@${domain}`;
}

function maskPhone(phone) {
  const lastFour = phone.slice(-4);
  return `******${lastFour}`;
}

function isEmailOtpConfigured() {
  return Boolean(
    BREVO_API_KEY &&
      EMAIL_FROM
  );
}

function isMobileOtpConfigured() {
  return Boolean(
    TWILIO_ACCOUNT_SID &&
      TWILIO_AUTH_TOKEN &&
      TWILIO_FROM_NUMBER
  );
}

let twilioClient = null;

function sendBrevoTransactionalEmail(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const request = https.request(
      {
        hostname: "api.brevo.com",
        port: 443,
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
        timeout: 15000,
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          const statusCode = response.statusCode || 500;

          if (statusCode >= 200 && statusCode < 300) {
            return resolve(responseBody);
          }

          let providerMessage = "";

          try {
            const parsed = JSON.parse(responseBody || "{}");
            providerMessage = parsed.message || parsed.code || "";
          } catch {
            providerMessage = "";
          }

          reject(
            new Error(
              providerMessage
                ? `Email provider rejected the request: ${providerMessage}`
                : `Email provider returned HTTP ${statusCode}.`
            )
          );
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(
        new Error("Email provider request timed out.")
      );
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.write(body);
    request.end();
  });
}

function getTwilioClient() {
  if (!isMobileOtpConfigured()) {
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );
  }

  return twilioClient;
}

async function sendEmailOtp(email, otp) {
  if (!isEmailOtpConfigured()) {
    throw new Error(
      "Email OTP is not configured on the backend."
    );
  }

  await sendBrevoTransactionalEmail({
    sender: {
      name: EMAIL_FROM_NAME,
      email: EMAIL_FROM,
    },
    to: [
      {
        email,
      },
    ],
    subject: "NagarSwar AI citizen verification code",
    textContent:
      `Your NagarSwar AI verification code is ${otp}. ` +
      "It expires in 5 minutes. Do not share this code with anyone.",
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17343d">
        <h2>NagarSwar AI verification</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;margin:18px 0">
          ${otp}
        </div>
        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendMobileOtp(phone, otp) {
  const client = getTwilioClient();

  if (!client) {
    throw new Error(
      "Mobile OTP is not configured on the backend."
    );
  }

  await client.messages.create({
    body:
      `NagarSwar AI verification code: ${otp}. ` +
      "Valid for 5 minutes. Do not share this code.",
    from: TWILIO_FROM_NUMBER,
    to: phone,
  });
}

function cleanupOtpHistory(key, now = Date.now()) {
  const oneHourAgo = now - 60 * 60 * 1000;
  const previous = otpSendHistory.get(key) || [];
  const recent = previous.filter((time) => time > oneHourAgo);

  if (recent.length) {
    otpSendHistory.set(key, recent);
  } else {
    otpSendHistory.delete(key);
  }

  return recent;
}

function checkOtpSendLimit(key) {
  const now = Date.now();
  const recent = cleanupOtpHistory(key, now);

  if (recent.length >= OTP_MAX_SENDS_PER_HOUR) {
    return {
      allowed: false,
      message:
        "Too many OTP requests. Please wait and try again later.",
    };
  }

  const lastSentAt = recent[recent.length - 1];

  if (
    lastSentAt &&
    now - lastSentAt < OTP_RESEND_COOLDOWN_MS
  ) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000
    );

    return {
      allowed: false,
      message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
    };
  }

  return { allowed: true };
}

function recordOtpSend(key) {
  const now = Date.now();
  const recent = cleanupOtpHistory(key, now);
  recent.push(now);
  otpSendHistory.set(key, recent);
}

function createCitizenSession(userId, remember = false) {
  const token = crypto.randomBytes(48).toString("hex");
  const ttl = remember
    ? CITIZEN_REMEMBER_TTL_MS
    : CITIZEN_SESSION_TTL_MS;

  const expiresAt = Date.now() + ttl;

  citizenSessions.set(token, {
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

function getValidCitizenSession(token) {
  if (!token) {
    return null;
  }

  const session = citizenSessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    citizenSessions.delete(token);
    return null;
  }

  return session;
}

async function requireCitizen(req, res, next) {
  const token = getBearerToken(req);
  const session = getValidCitizenSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Citizen authentication required.",
    });
  }

  const users = await readUsers();
  const user = users.find((item) => item.id === session.userId);

  if (!user) {
    citizenSessions.delete(token);

    return res.status(401).json({
      success: false,
      message: "Citizen account not found.",
    });
  }

  req.citizen = user;
  req.citizenToken = token;
  req.citizenSession = session;
  next();
}

function safeCitizenUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    createdAt: user.createdAt,
  };
}

function generateCitizenId(existingUsers) {
  let userId;

  do {
    userId = `CIT-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  } while (
    existingUsers.some((user) => user.id === userId)
  );

  return userId;
}

function getLoginAttemptKey(req, identifier) {
  return `${req.ip || "unknown"}:${identifier}`;
}

function checkCitizenLoginAttempts(key) {
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;
  const previous = citizenLoginAttempts.get(key) || [];

  const recent = previous.filter(
    (time) => time > fifteenMinutesAgo
  );

  citizenLoginAttempts.set(key, recent);

  if (recent.length >= 5) {
    return {
      allowed: false,
      message:
        "Too many failed login attempts. Please try again after 15 minutes.",
    };
  }

  return { allowed: true };
}

function recordFailedCitizenLogin(key) {
  const recent = citizenLoginAttempts.get(key) || [];
  recent.push(Date.now());
  citizenLoginAttempts.set(key, recent);
}

function clearCitizenLoginAttempts(key) {
  citizenLoginAttempts.delete(key);
}

const citizenAuthCleanup = setInterval(() => {
  const now = Date.now();

  for (const [token, session] of citizenSessions.entries()) {
    if (session.expiresAt <= now) {
      citizenSessions.delete(token);
    }
  }

  for (const [registrationId, pending] of pendingCitizenRegistrations.entries()) {
    if (pending.expiresAt <= now) {
      pendingCitizenRegistrations.delete(registrationId);
    }
  }

  for (const key of otpSendHistory.keys()) {
    cleanupOtpHistory(key, now);
  }
}, 15 * 60 * 1000);

citizenAuthCleanup.unref();

/* =========================================================
   MONGODB ATLAS STORAGE
========================================================= */

function withoutMongoId(document) {
  if (!document) {
    return document;
  }

  const {
    _id,
    ...rest
  } = document;

  return rest;
}

async function readComplaints() {
  try {
    const db =
      getDb();

    const complaints =
      await db
        .collection("complaints")
        .find({})
        .sort({
          submittedAt: -1,
        })
        .toArray();

    return complaints.map(
      withoutMongoId
    );
  } catch (error) {
    console.error(
      "❌ Error reading complaints from MongoDB:",
      error
    );

    throw error;
  }
}

async function saveComplaints(
  complaints
) {
  try {
    if (
      !Array.isArray(complaints) ||
      complaints.length === 0
    ) {
      return;
    }

    const db =
      getDb();

    const operations =
      complaints
        .filter(
          (complaint) =>
            complaint &&
            complaint.id
        )
        .map(
          (complaint) => ({
            updateOne: {
              filter: {
                id:
                  complaint.id,
              },

              update: {
                $set:
                  complaint,
              },

              upsert: true,
            },
          })
        );

    if (
      operations.length >
      0
    ) {
      await db
        .collection("complaints")
        .bulkWrite(
          operations,
          {
            ordered: false,
          }
        );
    }
  } catch (error) {
    console.error(
      "❌ Error saving complaints to MongoDB:",
      error
    );

    throw error;
  }
}

async function readUsers() {
  try {
    const db =
      getDb();

    const users =
      await db
        .collection("users")
        .find({})
        .sort({
          createdAt: 1,
        })
        .toArray();

    return users.map(
      withoutMongoId
    );
  } catch (error) {
    console.error(
      "❌ Error reading users from MongoDB:",
      error
    );

    throw error;
  }
}

async function saveUsers(
  users
) {
  try {
    if (
      !Array.isArray(users) ||
      users.length === 0
    ) {
      return;
    }

    const db =
      getDb();

    const operations =
      users
        .filter(
          (user) =>
            user &&
            user.id
        )
        .map(
          (user) => ({
            updateOne: {
              filter: {
                id:
                  user.id,
              },

              update: {
                $set:
                  user,
              },

              upsert: true,
            },
          })
        );

    if (
      operations.length >
      0
    ) {
      await db
        .collection("users")
        .bulkWrite(
          operations,
          {
            ordered: false,
          }
        );
    }
  } catch (error) {
    console.error(
      "❌ Error saving users to MongoDB:",
      error
    );

    throw error;
  }
}

/* =========================================================
   COMPLAINT ID
========================================================= */

function generateComplaintId(existingComplaints) {
  let complaintId;

  do {
    complaintId = `NSAI-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  } while (
    existingComplaints.some(
      (complaint) => complaint.id === complaintId
    )
  );

  return complaintId;
}

/* =========================================================
   SMART DEPARTMENT ROUTING
========================================================= */

function getDepartment(category) {
  const normalizedCategory = String(category || "")
    .toLowerCase()
    .trim();

  if (
    normalizedCategory.includes("road") ||
    normalizedCategory.includes("pothole")
  ) {
    return "Public Works / Municipal Engineering Department";
  }

  if (
    normalizedCategory.includes("sanitation") ||
    normalizedCategory.includes("waste") ||
    normalizedCategory.includes("garbage")
  ) {
    return "Sanitation and Solid Waste Management Department";
  }

  if (normalizedCategory.includes("electric")) {
    return "Electricity Department";
  }

  if (
    normalizedCategory.includes("health") ||
    normalizedCategory.includes("healthcare")
  ) {
    return "Public Health Department";
  }

  if (
    normalizedCategory.includes("water")
  ) {
    return "Water Supply Department";
  }

  if (
    normalizedCategory.includes("fire") ||
    normalizedCategory.includes("emergency")
  ) {
    return "Fire and Emergency Services";
  }

  return "Municipal Grievance Department";
}

/* =========================================================
   PRIORITY ANALYSIS
   Prototype rule-based civic urgency scoring
========================================================= */

function analyzePriority(category, title, description) {
  const text = `${title || ""} ${description || ""}`
    .toLowerCase()
    .trim();

  const normalizedCategory = String(category || "")
    .toLowerCase()
    .trim();

  let score = 20;
  const reasons = [];

  /* ---------- CATEGORY SCORE ---------- */

  if (
    normalizedCategory.includes("fire") ||
    normalizedCategory.includes("emergency")
  ) {
    score += 55;
    reasons.push("Emergency category");
  } else if (normalizedCategory.includes("electric")) {
    score += 25;
    reasons.push("Electrical safety issue");
  } else if (
    normalizedCategory.includes("health") ||
    normalizedCategory.includes("healthcare")
  ) {
    score += 25;
    reasons.push("Public healthcare impact");
  } else if (
    normalizedCategory.includes("road") ||
    normalizedCategory.includes("pothole")
  ) {
    score += 15;
    reasons.push("Road safety issue");
  } else if (normalizedCategory.includes("water")) {
    score += 15;
    reasons.push("Water service issue");
  } else if (
    normalizedCategory.includes("sanitation") ||
    normalizedCategory.includes("waste")
  ) {
    score += 10;
    reasons.push("Sanitation issue");
  }

  /* ---------- CRITICAL KEYWORDS ---------- */

  const criticalKeywords = [
    "fire",
    "explosion",
    "gas leak",
    "electric shock",
    "electrocution",
    "live wire",
    "building collapse",
    "collapsed building",
    "life threatening",
    "life-threatening",
    "major accident",
    "fatal accident",
    "people trapped",
    "person trapped",
  ];

  const criticalMatches = criticalKeywords.filter(
    (keyword) => text.includes(keyword)
  );

  if (criticalMatches.length > 0) {
    score += 45;

    reasons.push(
      `Critical risk detected: ${criticalMatches.join(", ")}`
    );
  }

  /* ---------- HIGH-RISK KEYWORDS ---------- */

  const highRiskKeywords = [
    "dangerous",
    "severe",
    "major",
    "huge",
    "large pothole",
    "flood",
    "flooding",
    "waterlogging",
    "water logged",
    "water filled",
    "blocked road",
    "road blocked",
    "fallen tree",
    "open manhole",
    "exposed wire",
    "sparking",
    "transformer",
    "no electricity",
    "hospital",
    "school",
    "college",
    "children",
    "elderly",
  ];

  const highRiskMatches = highRiskKeywords.filter(
    (keyword) => text.includes(keyword)
  );

  if (highRiskMatches.length > 0) {
    const keywordPoints = Math.min(
      highRiskMatches.length * 10,
      30
    );

    score += keywordPoints;

    reasons.push(
      `Public-risk indicators: ${highRiskMatches.join(", ")}`
    );
  }

  /* ---------- URGENCY WORDS ---------- */

  const urgencyKeywords = [
    "urgent",
    "immediately",
    "immediate",
    "emergency",
    "accident",
    "injury",
    "injured",
    "unsafe",
    "cannot pass",
    "cannot go",
    "not accessible",
  ];

  const urgencyMatches = urgencyKeywords.filter(
    (keyword) => text.includes(keyword)
  );

  if (urgencyMatches.length > 0) {
    score += Math.min(
      urgencyMatches.length * 10,
      25
    );

    reasons.push(
      `Urgency indicators: ${urgencyMatches.join(", ")}`
    );
  }

  score = Math.min(score, 100);

  let priority;

  if (score >= 80) {
    priority = "Critical";
  } else if (score >= 60) {
    priority = "High";
  } else if (score >= 40) {
    priority = "Medium";
  } else {
    priority = "Low";
  }

  return {
    priority,
    score,
    reasons:
      reasons.length > 0
        ? reasons
        : ["Standard civic complaint"],
  };
}

/* =========================================================
   HOME ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NagarSwar AI backend is running",
  });
});

/* =========================================================
   ADMIN LOGIN / SESSION
========================================================= */

app.post("/api/admin/login", (req, res) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({
      success: false,
      message:
        "Admin authentication is not configured on the backend.",
    });
  }

  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body.password || "");

  const validEmail = safeCompare(email, ADMIN_EMAIL);
  const validPassword = safeCompare(password, ADMIN_PASSWORD);

  if (!validEmail || !validPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin email or password.",
    });
  }

  const session = createAdminSession();

  res.json({
    success: true,
    message: "Admin login successful.",
    token: session.token,
    expiresAt: new Date(session.expiresAt).toISOString(),
    admin: {
      email: ADMIN_EMAIL,
    },
  });
});

app.get("/api/admin/verify", requireAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      email: req.admin.email,
    },
    expiresAt: new Date(req.admin.expiresAt).toISOString(),
  });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  adminSessions.delete(req.adminToken);

  res.json({
    success: true,
    message: "Admin logged out successfully.",
  });
});

/* =========================================================
   CITIZEN REGISTRATION / OTP
========================================================= */

app.post("/api/citizen/register/request-otp", async (req, res) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");
    const verificationMethod = String(
      req.body.verificationMethod || ""
    ).toLowerCase();

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (
      verificationMethod !== "email" &&
      verificationMethod !== "phone"
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose Email OTP or Mobile OTP.",
      });
    }

    const users = await readUsers();

    if (users.some((user) => user.email === email)) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email address.",
      });
    }

    if (users.some((user) => user.phone === phone)) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this mobile number.",
      });
    }

    if (
      verificationMethod === "email" &&
      !isEmailOtpConfigured()
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Email OTP service is not configured yet. Add BREVO_API_KEY and EMAIL_FROM to the backend environment.",
      });
    }

    if (
      verificationMethod === "phone" &&
      !isMobileOtpConfigured()
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Mobile OTP service is not configured yet. Configure the Twilio settings in backend .env.",
      });
    }

    const destination =
      verificationMethod === "email" ? email : phone;

    const otpRateKey =
      `${verificationMethod}:${destination}`;

    const sendLimit = checkOtpSendLimit(otpRateKey);

    if (!sendLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: sendLimit.message,
      });
    }

    const registrationId =
      crypto.randomBytes(24).toString("hex");

    const otp = generateOtp();
    const passwordData = hashPassword(password);

    const pendingRegistration = {
      registrationId,
      firstName,
      lastName,
      email,
      phone,
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      verificationMethod,
      otpHash: hashOtp(otp, registrationId),
      attempts: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_TTL_MS,
      resendAvailableAt:
        Date.now() + OTP_RESEND_COOLDOWN_MS,
    };

    if (verificationMethod === "email") {
      await sendEmailOtp(email, otp);
    } else {
      await sendMobileOtp(phone, otp);
    }

    pendingCitizenRegistrations.set(
      registrationId,
      pendingRegistration
    );

    recordOtpSend(otpRateKey);

    res.json({
      success: true,
      message:
        verificationMethod === "email"
          ? "Verification code sent to your email."
          : "Verification code sent to your mobile number.",
      registrationId,
      verificationMethod,
      destination:
        verificationMethod === "email"
          ? maskEmail(email)
          : maskPhone(phone),
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      resendAfterSeconds: Math.floor(
        OTP_RESEND_COOLDOWN_MS / 1000
      ),
    });
  } catch (error) {
    console.error("❌ OTP request failed:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to send verification code.",
    });
  }
});

app.post("/api/citizen/register/resend-otp", async (req, res) => {
  try {
    const registrationId = String(
      req.body.registrationId || ""
    ).trim();

    const pending =
      pendingCitizenRegistrations.get(registrationId);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message:
          "Registration session not found. Please start registration again.",
      });
    }

    if (pending.expiresAt <= Date.now()) {
      pendingCitizenRegistrations.delete(registrationId);

      return res.status(410).json({
        success: false,
        message:
          "Verification session expired. Please start registration again.",
      });
    }

    if (Date.now() < pending.resendAvailableAt) {
      const waitSeconds = Math.ceil(
        (pending.resendAvailableAt - Date.now()) / 1000
      );

      return res.status(429).json({
        success: false,
        message:
          `Please wait ${waitSeconds} seconds before resending the OTP.`,
      });
    }

    const destination =
      pending.verificationMethod === "email"
        ? pending.email
        : pending.phone;

    const otpRateKey =
      `${pending.verificationMethod}:${destination}`;

    const sendLimit = checkOtpSendLimit(otpRateKey);

    if (!sendLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: sendLimit.message,
      });
    }

    const otp = generateOtp();

    if (pending.verificationMethod === "email") {
      await sendEmailOtp(pending.email, otp);
    } else {
      await sendMobileOtp(pending.phone, otp);
    }

    pending.otpHash = hashOtp(otp, registrationId);
    pending.attempts = 0;
    pending.expiresAt = Date.now() + OTP_TTL_MS;
    pending.resendAvailableAt =
      Date.now() + OTP_RESEND_COOLDOWN_MS;

    pendingCitizenRegistrations.set(
      registrationId,
      pending
    );

    recordOtpSend(otpRateKey);

    res.json({
      success: true,
      message: "A new verification code has been sent.",
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      resendAfterSeconds: Math.floor(
        OTP_RESEND_COOLDOWN_MS / 1000
      ),
    });
  } catch (error) {
    console.error("❌ OTP resend failed:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to resend verification code.",
    });
  }
});

app.post("/api/citizen/register/verify-otp", async (req, res) => {
  try {
    const registrationId = String(
      req.body.registrationId || ""
    ).trim();

    const otp = String(req.body.otp || "")
      .replace(/\D/g, "")
      .slice(0, 6);

    const pending =
      pendingCitizenRegistrations.get(registrationId);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message:
          "Registration session not found. Please start registration again.",
      });
    }

    if (pending.expiresAt <= Date.now()) {
      pendingCitizenRegistrations.delete(registrationId);

      return res.status(410).json({
        success: false,
        message:
          "Verification code expired. Please start registration again.",
      });
    }

    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      pendingCitizenRegistrations.delete(registrationId);

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please start registration again.",
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit verification code.",
      });
    }

    if (
      !verifyOtpHash(
        otp,
        registrationId,
        pending.otpHash
      )
    ) {
      pending.attempts += 1;

      pendingCitizenRegistrations.set(
        registrationId,
        pending
      );

      const remaining =
        OTP_MAX_ATTEMPTS - pending.attempts;

      return res.status(401).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
            : "Incorrect OTP. Please start registration again.",
      });
    }

    const users = await readUsers();

    if (users.some((user) => user.email === pending.email)) {
      pendingCitizenRegistrations.delete(registrationId);

      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email address.",
      });
    }

    if (users.some((user) => user.phone === pending.phone)) {
      pendingCitizenRegistrations.delete(registrationId);

      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this mobile number.",
      });
    }

    const user = {
      id: generateCitizenId(users),
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      passwordSalt: pending.passwordSalt,
      emailVerified:
        pending.verificationMethod === "email",
      phoneVerified:
        pending.verificationMethod === "phone",
      verificationMethod:
        pending.verificationMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(user);
    await saveUsers(users);

    pendingCitizenRegistrations.delete(registrationId);

    res.status(201).json({
      success: true,
      message:
        "Citizen account created successfully. You can now sign in.",
      user: safeCitizenUser(user),
    });
  } catch (error) {
    console.error("❌ Citizen registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create citizen account.",
    });
  }
});

/* =========================================================
   CITIZEN LOGIN / SESSION
========================================================= */

app.post("/api/citizen/login", async (req, res) => {
  try {
    const rawIdentifier = String(
      req.body.identifier || ""
    ).trim();

    const password = String(req.body.password || "");
    const remember = Boolean(req.body.remember);

    const emailIdentifier = normalizeEmail(rawIdentifier);
    const phoneIdentifier = normalizePhone(rawIdentifier);

    const users = await readUsers();

    const user = users.find(
      (item) =>
        item.email === emailIdentifier ||
        (phoneIdentifier && item.phone === phoneIdentifier)
    );

    const attemptIdentifier =
      phoneIdentifier || emailIdentifier;

    const attemptKey = getLoginAttemptKey(
      req,
      attemptIdentifier
    );

    const loginLimit =
      checkCitizenLoginAttempts(attemptKey);

    if (!loginLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: loginLimit.message,
      });
    }

    if (
      !user ||
      !verifyPassword(
        password,
        user.passwordSalt,
        user.passwordHash
      )
    ) {
      recordFailedCitizenLogin(attemptKey);

      return res.status(401).json({
        success: false,
        message:
          "Invalid email/mobile number or password.",
      });
    }

    const usingEmail =
      user.email === emailIdentifier;

    const usingPhone =
      Boolean(phoneIdentifier) &&
      user.phone === phoneIdentifier;

    if (usingEmail && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "This email address is not verified. Sign in using your verified mobile number.",
      });
    }

    if (usingPhone && !user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message:
          "This mobile number is not verified. Sign in using your verified email address.",
      });
    }

    clearCitizenLoginAttempts(attemptKey);

    const session = createCitizenSession(
      user.id,
      remember
    );

    res.json({
      success: true,
      message: "Citizen login successful.",
      token: session.token,
      expiresAt: new Date(
        session.expiresAt
      ).toISOString(),
      user: safeCitizenUser(user),
    });
  } catch (error) {
    console.error("❌ Citizen login failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to sign in.",
    });
  }
});

app.get("/api/citizen/verify", requireCitizen, (req, res) => {
  res.json({
    success: true,
    user: safeCitizenUser(req.citizen),
    expiresAt: new Date(
      req.citizenSession.expiresAt
    ).toISOString(),
  });
});

app.post("/api/citizen/logout", requireCitizen, (req, res) => {
  citizenSessions.delete(req.citizenToken);

  res.json({
    success: true,
    message: "Citizen logged out successfully.",
  });
});

/* =========================================================
   GET ALL COMPLAINTS
   Public/admin-compatible feed used by the existing map/dashboard.
========================================================= */

app.get("/api/complaints", async (req, res) => {
  const complaints = await readComplaints();

  res.json({
    success: true,
    total: complaints.length,
    complaints,
  });
});

/* =========================================================
   GET LOGGED-IN CITIZEN'S COMPLAINTS
========================================================= */

app.get(
  "/api/citizen/complaints",
  requireCitizen,
  async (req, res) => {
    const complaints = await readComplaints();

    const citizenComplaints = complaints.filter(
      (complaint) =>
        complaint.citizenId === req.citizen.id
    );

    res.json({
      success: true,
      total: citizenComplaints.length,
      complaints: citizenComplaints,
    });
  }
);

/* =========================================================
   GET ONE COMPLAINT
========================================================= */

app.get("/api/complaints/:id", async (req, res) => {
  const complaints = await readComplaints();

  const complaint = complaints.find(
    (item) => item.id === req.params.id
  );

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found",
    });
  }

  res.json({
    success: true,
    complaint,
  });
});

/* =========================================================
   CREATE COMPLAINT
========================================================= */

app.post(
  "/api/complaints",
  requireCitizen,
  upload.single("evidence"),
  async (req, res) => {
  try {
    console.log("📥 New complaint received:", req.body);

    const complaints = await readComplaints();

    const complaintId =
      generateComplaintId(complaints);

    const title =
      req.body.title || "Civic Issue";

    const category =
      req.body.category || "Other Public Issue";

    const description =
      req.body.description || "";

    const department =
      getDepartment(category);

    const priorityAnalysis =
      analyzePriority(
        category,
        title,
        description
      );

    /*
      STEP 1:
      Exact reused-image detection.
    */

    const imageReuseAnalysis =
      req.file
        ? analyzeImageReuse({
            uploadedFileBuffer:
              req.file.buffer,
            complaints,
            uploadsDir,
          })
        : {
            evidenceHash: null,
            isReused: false,
            matchedComplaintIds: [],
            matchCount: 0,
            status: "No Evidence",
            detectionType:
              "SHA-256 exact file fingerprint",
          };

    /*
      STEP 2:
      Duplicate complaint detection.

      This compares:
      - complaint category
      - GPS distance
      - title/description text similarity

      It does not automatically reject the complaint.
      It only links/flags possible duplicates for review.
    */

    const duplicateAnalysis =
      analyzeDuplicateComplaint({
        newComplaint: {
          title,
          category,
          description,
          location:
            req.body.location || "",
          latitude:
            req.body.latitude ?? null,
          longitude:
            req.body.longitude ?? null,
        },
        existingComplaints:
          complaints,
      });

    /*
      STEP 3:
      AI complaint-text ↔ evidence-photo matching.

      The AI result is advisory only. A low score does NOT
      automatically reject the citizen's complaint.
    */

    const evidenceVerification =
      req.file
        ? await verifyEvidenceMatch({
            imageBuffer:
              req.file.buffer,
            mimeType:
              req.file.mimetype,
            complaint: {
              title,
              category,
              description,
              location:
                req.body.location || "",
            },
          })
        : {
            status: "No Evidence",
            score: null,
            confidence: null,
            reviewRequired: false,
            visualSummary:
              "No evidence image was uploaded.",
            suspectedIssueType: null,
            imageQuality: null,
            matchingFactors: [],
            mismatchFactors: [],
            analysisType:
              "No image available for AI verification",
            model: null,
            analyzedAt: null,
          };

    /*
      CLOUD EVIDENCE STORAGE

      The upload buffer has already been used for:
      - exact reused-image hash
      - Gemini evidence verification

      It is now uploaded to Cloudinary. No permanent local file is
      created for new complaints.
    */

    const cloudinaryEvidence =
      req.file
        ? await uploadEvidenceBuffer({
            buffer:
              req.file.buffer,

            complaintId,

            originalName:
              req.file.originalname,

            mimeType:
              req.file.mimetype,
          })
        : null;

    const newComplaint = {
      id: complaintId,

      citizenId: req.citizen.id,

      title,
      category,
      description,

      location:
        req.body.location || "",

      latitude:
        req.body.latitude ?? null,

      longitude:
        req.body.longitude ?? null,

      evidenceUrl:
        cloudinaryEvidence
          ? cloudinaryEvidence.secureUrl
          : null,

      evidenceFileName:
        cloudinaryEvidence
          ? cloudinaryEvidence.publicId
          : null,

      evidenceOriginalName:
        req.file
          ? req.file.originalname
          : null,

      evidenceMimeType:
        req.file
          ? req.file.mimetype
          : null,

      evidenceSize:
        req.file
          ? req.file.size
          : null,

      evidenceStorage:
        cloudinaryEvidence
          ? "cloudinary"
          : null,

      evidencePublicId:
        cloudinaryEvidence
          ? cloudinaryEvidence.publicId
          : null,

      evidenceCloudinaryAssetId:
        cloudinaryEvidence
          ? cloudinaryEvidence.assetId
          : null,

      evidenceCloudinaryFormat:
        cloudinaryEvidence
          ? cloudinaryEvidence.format
          : null,

      evidenceCloudinaryWidth:
        cloudinaryEvidence
          ? cloudinaryEvidence.width
          : null,

      evidenceCloudinaryHeight:
        cloudinaryEvidence
          ? cloudinaryEvidence.height
          : null,

      evidenceUploadedAt:
        cloudinaryEvidence
          ? cloudinaryEvidence.createdAt
          : null,

      evidenceImageHash:
        imageReuseAnalysis.evidenceHash,

      imageReuse: {
        isReused:
          imageReuseAnalysis.isReused,
        status:
          imageReuseAnalysis.status,
        matchedComplaintIds:
          imageReuseAnalysis.matchedComplaintIds,
        matchCount:
          imageReuseAnalysis.matchCount,
        detectionType:
          imageReuseAnalysis.detectionType,
      },

      evidenceVerification,

      adminEvidenceReview: {
        status: req.file
          ? "Pending Review"
          : "Not Required",
        note: "",
        reviewedAt: null,
        reviewedBy: null,
      },

      duplicateDetection: {
        isPossibleDuplicate:
          duplicateAnalysis.isPossibleDuplicate,
        status:
          duplicateAnalysis.status,
        score:
          duplicateAnalysis.score,
        matchedComplaintId:
          duplicateAnalysis.matchedComplaintId,
        matchedComplaintIds:
          duplicateAnalysis.matchedComplaintIds,
        distanceMeters:
          duplicateAnalysis.distanceMeters,
        textSimilarity:
          duplicateAnalysis.textSimilarity,
        categoryMatched:
          duplicateAnalysis.categoryMatched,
        reasons:
          duplicateAnalysis.reasons,
        detectionType:
          duplicateAnalysis.detectionType,
      },

      duplicateOf:
        duplicateAnalysis.isPossibleDuplicate
          ? duplicateAnalysis.matchedComplaintId
          : null,

      status: "Under Review",

      priority:
        priorityAnalysis.priority,

      priorityScore:
        priorityAnalysis.score,

      priorityReasons:
        priorityAnalysis.reasons,

      department,

      analysisType:
        "Rule-based prototype analysis",

      submittedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    /*
      If this complaint appears to duplicate an existing open
      complaint, keep both records but link them together.

      This avoids silently rejecting a real citizen report while
      still helping the admin identify repeated reports.
    */

    if (
      duplicateAnalysis.isPossibleDuplicate &&
      duplicateAnalysis.matchedComplaintId
    ) {
      const matchedIndex =
        complaints.findIndex(
          (complaint) =>
            complaint.id ===
            duplicateAnalysis.matchedComplaintId
        );

      if (matchedIndex !== -1) {
        const matchedComplaint =
          complaints[matchedIndex];

        const linkedIds =
          Array.isArray(
            matchedComplaint.duplicateLinkedComplaintIds
          )
            ? matchedComplaint.duplicateLinkedComplaintIds
            : [];

        matchedComplaint.duplicateLinkedComplaintIds =
          Array.from(
            new Set([
              ...linkedIds,
              complaintId,
            ])
          );

        matchedComplaint.duplicateReportCount =
          matchedComplaint.duplicateLinkedComplaintIds.length;

        matchedComplaint.updatedAt =
          new Date().toISOString();
      }
    }

    complaints.unshift(newComplaint);

    await saveComplaints(complaints);

    console.log(
      "✅ Complaint saved:",
      complaintId
    );

    if (imageReuseAnalysis.isReused) {
      console.log(
        "⚠️ Reused evidence detected:",
        imageReuseAnalysis.matchedComplaintIds
      );
    } else if (req.file) {
      console.log(
        "🖼️ Evidence fingerprint is unique."
      );
    }

    if (
      duplicateAnalysis.isPossibleDuplicate
    ) {
      console.log(
        `🔁 Possible duplicate: ${duplicateAnalysis.matchedComplaintId} (${duplicateAnalysis.score}/100)`
      );

      if (
        duplicateAnalysis.distanceMeters !== null
      ) {
        console.log(
          `📍 Duplicate distance: ${duplicateAnalysis.distanceMeters} m`
        );
      }

      console.log(
        `📝 Text similarity: ${duplicateAnalysis.textSimilarity}%`
      );
    } else {
      console.log(
        `🔎 Duplicate check: ${duplicateAnalysis.status}`
      );
    }

    if (req.file) {
      const evidenceScore =
        evidenceVerification.score === null
          ? "N/A"
          : `${evidenceVerification.score}/100`;

      console.log(
        `🤖 Evidence AI: ${evidenceVerification.status} (${evidenceScore})`
      );

      if (evidenceVerification.reviewRequired) {
        console.log(
          "👀 Evidence flagged for manual admin review."
        );
      }
    }

    console.log(
      `🧠 Priority: ${newComplaint.priority} (${newComplaint.priorityScore}/100)`
    );

    console.log(
      `🏢 Department: ${newComplaint.department}`
    );

    if (newComplaint.evidenceUrl) {
      console.log(
        `☁️ Evidence uploaded to Cloudinary: ${newComplaint.evidenceUrl}`
      );
    }

    res.status(201).json({
      success: true,
      message:
        "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error(
      "❌ Complaint submission failed:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to submit complaint",
    });
  }
  }
);

/* =========================================================
   ADMIN EVIDENCE REVIEW
========================================================= */

app.patch(
  "/api/complaints/:id/evidence-review",
  requireAdmin,
  async (req, res) => {
    try {
      const complaints =
        await readComplaints();

      const index =
        complaints.findIndex(
          (item) =>
            item.id === req.params.id
        );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      if (!complaints[index].evidenceUrl) {
        return res.status(400).json({
          success: false,
          message:
            "This complaint does not have evidence to review.",
        });
      }

      const allowedReviewStatuses = [
        "Pending Review",
        "Approved",
        "Needs Review",
        "Suspicious",
      ];

      const reviewStatus =
        String(req.body.status || "").trim();

      if (
        !allowedReviewStatuses.includes(
          reviewStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid evidence review status.",
          allowedReviewStatuses,
        });
      }

      const note =
        String(req.body.note || "")
          .trim()
          .slice(0, 500);

      complaints[index].adminEvidenceReview = {
        status: reviewStatus,
        note,
        reviewedAt:
          reviewStatus === "Pending Review"
            ? null
            : new Date().toISOString(),
        reviewedBy:
          reviewStatus === "Pending Review"
            ? null
            : req.admin.email,
      };

      complaints[index].updatedAt =
        new Date().toISOString();

      await saveComplaints(complaints);

      console.log(
        `🧑‍⚖️ Evidence review: ${complaints[index].id} → ${reviewStatus}`
      );

      res.json({
        success: true,
        message:
          "Evidence review updated.",
        complaint:
          complaints[index],
      });
    } catch (error) {
      console.error(
        "❌ Evidence review update failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update evidence review.",
      });
    }
  }
);

/* =========================================================
   UPDATE COMPLAINT STATUS
========================================================= */

app.patch(
  "/api/complaints/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const complaints =
        await readComplaints();

      const index =
        complaints.findIndex(
          (item) =>
            item.id === req.params.id
        );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      const allowedStatuses = [
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ];

      const newStatus =
        req.body.status;

      if (
        !allowedStatuses.includes(
          newStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid complaint status",
          allowedStatuses,
        });
      }

      complaints[index].status =
        newStatus;

      complaints[index].updatedAt =
        new Date().toISOString();

      if (
        newStatus === "Resolved" &&
        !complaints[index].resolvedAt
      ) {
        complaints[index].resolvedAt =
          new Date().toISOString();
      }

      await saveComplaints(complaints);

      console.log(
        `🔄 ${complaints[index].id} → ${newStatus}`
      );

      res.json({
        success: true,
        message:
          "Complaint status updated",
        complaint:
          complaints[index],
      });
    } catch (error) {
      console.error(
        "❌ Status update failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update complaint status",
      });
    }
  }
);

/* =========================================================
   UPLOAD ERROR HANDLER
========================================================= */

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Evidence image must be 5 MB or smaller.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Evidence upload failed.",
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Request failed.",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await connectMongo();
    await ensureMongoIndexes();

    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env"
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "✅ NagarSwar AI Backend is Running"
      );
      console.log(
        `🌐 http://localhost:${PORT}`
      );
      console.log(
        "☁️ MongoDB Atlas Storage: ON"
      );
      console.log(
        `🗄️ Database: ${
          process.env.MONGODB_DB_NAME ||
          "nagarswar"
        }`
      );
      console.log(
        "🧠 Smart Priority Analysis: ON"
      );
      console.log(
        "🏢 Department Routing: ON"
      );
      console.log(
        "📷 Evidence Upload: ON"
      );
      console.log(
        "☁️ Cloudinary Evidence Storage: ON"
      );
      console.log(
        "🧬 Reused Image Detection: ON"
      );
      console.log(
        "🔎 Duplicate Complaint Detection: ON"
      );
      console.log(
        "🧑‍⚖️ Admin Evidence Review: ON"
      );
      console.log(
        isEvidenceAiConfigured()
          ? `🤖 Gemini Evidence Matching: ON (${getEvidenceAiModel()})`
          : "⚠️ Gemini Evidence Matching: NOT CONFIGURED"
      );
      console.log(
        ADMIN_EMAIL &&
          ADMIN_PASSWORD
          ? "🔐 Admin Authentication: ON"
          : "⚠️ Admin Authentication: NOT CONFIGURED"
      );
      console.log(
        "👤 Citizen Authentication: ON"
      );
      console.log(
        "🔗 Citizen Complaint Ownership: ON"
      );
      console.log(
        isEmailOtpConfigured()
          ? "✉️ Email OTP: ON (Brevo HTTPS API)"
          : "⚠️ Email OTP: NOT CONFIGURED"
      );
      console.log(
        isMobileOtpConfigured()
          ? "📱 Mobile OTP: ON"
          : "⚠️ Mobile OTP: NOT CONFIGURED"
      );
      console.log(
        "======================================"
      );
      console.log(
        "⚡ Keep this terminal OPEN"
      );
    });
  } catch (error) {
    console.error(
      "❌ NagarSwar backend could not start:",
      error.message
    );

    process.exit(1);
  }
}

async function shutdownServer() {
  try {
    await closeMongo();
  } finally {
    process.exit(0);
  }
}

process.on(
  "SIGINT",
  shutdownServer
);

process.on(
  "SIGTERM",
  shutdownServer
);

startServer();
