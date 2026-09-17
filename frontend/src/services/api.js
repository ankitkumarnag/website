const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ADMIN_TOKEN_KEY = "nagarswarAdminToken";
const CITIZEN_TOKEN_KEY = "nagarswarCitizenToken";
const CITIZEN_USER_KEY = "nagarswarCitizenUser";

async function request(endpoint, options = {}) {
  try {
    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : {
          message: await response.text(),
        };

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  } catch (error) {
    console.error("NagarSwar API Error:", error);
    throw error;
  }
}

/* =========================
   ADMIN SESSION
========================= */

export function getAdminToken() {
  return (
    sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    ""
  );
}

export function saveAdminToken(token, remember = false) {
  clearAdminSession();

  if (remember) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAdminAuthHeaders() {
  const token = getAdminToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

/* =========================
   CITIZEN SESSION
========================= */

export function getCitizenToken() {
  return (
    sessionStorage.getItem(CITIZEN_TOKEN_KEY) ||
    localStorage.getItem(CITIZEN_TOKEN_KEY) ||
    ""
  );
}

export function getCitizenUser() {
  const raw =
    sessionStorage.getItem(CITIZEN_USER_KEY) ||
    localStorage.getItem(CITIZEN_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCitizenSession(
  token,
  user,
  remember = false
) {
  clearCitizenSession();

  const storage = remember
    ? localStorage
    : sessionStorage;

  storage.setItem(CITIZEN_TOKEN_KEY, token);
  storage.setItem(
    CITIZEN_USER_KEY,
    JSON.stringify(user || null)
  );
}

export function clearCitizenSession() {
  sessionStorage.removeItem(CITIZEN_TOKEN_KEY);
  sessionStorage.removeItem(CITIZEN_USER_KEY);

  localStorage.removeItem(CITIZEN_TOKEN_KEY);
  localStorage.removeItem(CITIZEN_USER_KEY);
}

function getCitizenAuthHeaders() {
  const token = getCitizenToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

/* =========================
   COMPLAINTS
========================= */

export async function submitComplaint(complaintData) {
  const isFormData =
    typeof FormData !== "undefined" &&
    complaintData instanceof FormData;

  return request("/complaints", {
    method: "POST",
    headers: getCitizenAuthHeaders(),
    body: isFormData
      ? complaintData
      : JSON.stringify(complaintData),
  });
}

export async function getAllComplaints() {
  return request("/complaints");
}

export async function getCitizenComplaints() {
  return request("/citizen/complaints", {
    headers: getCitizenAuthHeaders(),
  });
}

export async function getComplaintById(complaintId) {
  return request(`/complaints/${complaintId}`);
}

export async function updateComplaintStatus(complaintId, status) {
  return request(`/complaints/${complaintId}/status`, {
    method: "PATCH",
    headers: getAdminAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function updateEvidenceReview(
  complaintId,
  status,
  note = ""
) {
  return request(
    `/complaints/${complaintId}/evidence-review`,
    {
      method: "PATCH",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({
        status,
        note,
      }),
    }
  );
}

/* =========================
   ADMIN AUTH
========================= */

export async function adminLogin(email, password) {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function verifyAdminSession() {
  return request("/admin/verify", {
    headers: getAdminAuthHeaders(),
  });
}

export async function adminLogout() {
  const token = getAdminToken();

  if (!token) {
    clearAdminSession();
    return;
  }

  try {
    await request("/admin/logout", {
      method: "POST",
      headers: getAdminAuthHeaders(),
    });
  } finally {
    clearAdminSession();
  }
}

/* =========================
   CITIZEN REGISTRATION + OTP
========================= */

export async function requestCitizenOtp(payload) {
  return request("/citizen/register/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendCitizenOtp(registrationId) {
  return request("/citizen/register/resend-otp", {
    method: "POST",
    body: JSON.stringify({ registrationId }),
  });
}

export async function verifyCitizenOtp(registrationId, otp) {
  return request("/citizen/register/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      registrationId,
      otp,
    }),
  });
}

/* =========================
   CITIZEN LOGIN / SESSION
========================= */

export async function citizenLogin(
  identifier,
  password,
  remember = false
) {
  return request("/citizen/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      remember,
    }),
  });
}

export async function verifyCitizenSession() {
  return request("/citizen/verify", {
    headers: getCitizenAuthHeaders(),
  });
}

export async function citizenLogout() {
  const token = getCitizenToken();

  if (!token) {
    clearCitizenSession();
    return;
  }

  try {
    await request("/citizen/logout", {
      method: "POST",
      headers: getCitizenAuthHeaders(),
    });
  } finally {
    clearCitizenSession();
  }
}

export default {
  submitComplaint,
  getAllComplaints,
  getCitizenComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateEvidenceReview,

  adminLogin,
  verifyAdminSession,
  adminLogout,
  getAdminToken,
  saveAdminToken,
  clearAdminSession,

  requestCitizenOtp,
  resendCitizenOtp,
  verifyCitizenOtp,
  citizenLogin,
  verifyCitizenSession,
  citizenLogout,
  getCitizenToken,
  getCitizenUser,
  saveCitizenSession,
  clearCitizenSession,
};
