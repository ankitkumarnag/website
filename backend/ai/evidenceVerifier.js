const fs = require("fs");
const https = require("https");

/*
  =========================================================
  NAGARSWAR AI
  STEP 3: COMPLAINT TEXT ↔ EVIDENCE PHOTO MATCHING
  GEMINI VERSION
  =========================================================

  Provider:
  Google Gemini API

  Default model:
  gemini-3.6-flash

  What this module does:
  - Sends complaint title/category/description/location
    together with the uploaded evidence image.
  - Asks Gemini to judge whether the image is visually
    consistent with the complaint.
  - Returns a score, confidence, visual summary and reasons.
  - Never automatically rejects a complaint.
  - Low scores are flagged for manual review.
  - If Gemini is unavailable, the complaint still saves.
*/

function getGeminiApiKey() {
  return String(
    process.env.GEMINI_API_KEY || ""
  ).trim();
}

function getEvidenceAiModel() {
  const configuredModel = String(
    process.env.GEMINI_EVIDENCE_MODEL ||
      "gemini-3.6-flash"
  ).trim();

  /*
    Gemini 2.5 Flash is no longer available to some new
    Gemini API users. Automatically migrate the old NagarSwar
    configuration to the current stable Flash model.
  */
  if (
    configuredModel === "gemini-2.5-flash" ||
    configuredModel === "models/gemini-2.5-flash"
  ) {
    return "gemini-3.6-flash";
  }

  return configuredModel;
}

function isEvidenceAiEnabled() {
  return (
    String(
      process.env.AI_EVIDENCE_VERIFICATION_ENABLED ||
        "true"
    ).toLowerCase() !== "false"
  );
}

function getGeminiTimeoutMs() {
  const parsed = Number(
    process.env.GEMINI_TIMEOUT_MS ||
      process.env.OPENAI_TIMEOUT_MS ||
      30000
  );

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 30000;
}

function isEvidenceAiConfigured() {
  return Boolean(
    isEvidenceAiEnabled() &&
      getGeminiApiKey()
  );
}

function statusFromScore(score) {
  if (score >= 75) {
    return "Strong Match";
  }

  if (score >= 50) {
    return "Possible Match";
  }

  if (score >= 25) {
    return "Needs Manual Review";
  }

  return "Likely Mismatch";
}

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(
    Math.min(
      100,
      Math.max(0, number)
    )
  );
}

function unavailableResult(
  status,
  summary
) {
  return {
    status,
    score: null,
    confidence: null,
    reviewRequired: true,
    visualSummary: summary,
    suspectedIssueType: null,
    imageQuality: null,
    matchingFactors: [],
    mismatchFactors: [],
    analysisType:
      "Google Gemini multimodal evidence verification",
    provider: "Google Gemini",
    model:
      getEvidenceAiModel(),
    analyzedAt:
      new Date().toISOString(),
  };
}

function imageToBase64({
  imagePath,
  imageBuffer,
}) {
  if (
    Buffer.isBuffer(
      imageBuffer
    )
  ) {
    return imageBuffer.toString(
      "base64"
    );
  }

  if (imagePath) {
    return fs
      .readFileSync(
        imagePath
      )
      .toString(
        "base64"
      );
  }

  throw new Error(
    "No evidence image data was provided."
  );
}

function extractGeminiText(
  responseBody
) {
  const candidates =
    responseBody?.candidates;

  if (
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {
    return "";
  }

  const parts =
    candidates[0]
      ?.content
      ?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) =>
      typeof part?.text === "string"
        ? part.text
        : ""
    )
    .join("")
    .trim();
}

function requestGemini(
  body
) {
  return new Promise(
    (resolve, reject) => {
      const model =
        encodeURIComponent(
          getEvidenceAiModel()
        );

      const apiKey =
        encodeURIComponent(
          getGeminiApiKey()
        );

      const requestBody =
        JSON.stringify(body);

      const req =
        https.request(
          {
            hostname:
              "generativelanguage.googleapis.com",

            port: 443,

            path:
              `/v1beta/models/${model}:generateContent?key=${apiKey}`,

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Content-Length":
                Buffer.byteLength(
                  requestBody
                ),
            },
          },

          (res) => {
            let raw = "";

            res.setEncoding(
              "utf8"
            );

            res.on(
              "data",
              (chunk) => {
                raw += chunk;
              }
            );

            res.on(
              "end",
              () => {
                let parsed = {};

                try {
                  parsed =
                    raw
                      ? JSON.parse(raw)
                      : {};
                } catch {
                  return reject(
                    new Error(
                      "Gemini returned an invalid JSON response."
                    )
                  );
                }

                if (
                  res.statusCode < 200 ||
                  res.statusCode >= 300
                ) {
                  const message =
                    parsed?.error?.message ||
                    `Gemini request failed with status ${res.statusCode}.`;

                  return reject(
                    new Error(message)
                  );
                }

                resolve(parsed);
              }
            );
          }
        );

      req.setTimeout(
        getGeminiTimeoutMs(),
        () => {
          req.destroy(
            new Error(
              "Gemini evidence verification timed out."
            )
          );
        }
      );

      req.on(
        "error",
        reject
      );

      req.write(
        requestBody
      );

      req.end();
    }
  );
}

function buildPrompt(
  complaint
) {
  return `
You are an evidence-verification assistant for NagarSwar AI,
a civic complaint platform.

Your task is ONLY to evaluate whether the uploaded image is
visually consistent with the citizen's complaint.

Complaint details:

Title:
${complaint?.title || "Not provided"}

Category:
${complaint?.category || "Not provided"}

Description:
${complaint?.description || "Not provided"}

Location text:
${complaint?.location || "Not provided"}

Important rules:

1. Judge only what is actually visible in the image.
2. Do not assume facts that cannot be seen.
3. A photo does not need to prove every sentence in the complaint.
   It only needs to be meaningfully relevant to the reported issue.
4. Do not identify people.
5. If the image is blurry, unrelated, generic, or insufficient,
   lower the score and explain why.
6. If the complaint is about a pothole and the image clearly shows
   road damage/pothole, that is strong visual consistency.
7. If the complaint is about water leakage and the image shows
   leaking/broken water infrastructure or visible leakage, that is
   strong visual consistency.
8. Do not reject the complaint. This result is advisory for an admin.
9. Score from 0 to 100:
   - 75-100 = Strong Match
   - 50-74 = Possible Match
   - 25-49 = Needs Manual Review
   - 0-24 = Likely Mismatch

Return only the requested structured JSON.
`.trim();
}

const RESPONSE_SCHEMA = {
  type: "object",

  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },

    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },

    visualSummary: {
      type: "string",
    },

    suspectedIssueType: {
      type: "string",
    },

    imageQuality: {
      type: "string",
      enum: [
        "Good",
        "Average",
        "Poor",
        "Unclear",
      ],
    },

    matchingFactors: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 6,
    },

    mismatchFactors: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 6,
    },
  },

  required: [
    "score",
    "confidence",
    "visualSummary",
    "suspectedIssueType",
    "imageQuality",
    "matchingFactors",
    "mismatchFactors",
  ],
};

async function verifyEvidenceMatch({
  imagePath,
  imageBuffer,
  mimeType,
  complaint,
}) {
  if (
    !imagePath &&
    !Buffer.isBuffer(
      imageBuffer
    )
  ) {
    return unavailableResult(
      "No Evidence",
      "No evidence image was uploaded."
    );
  }

  if (!isEvidenceAiEnabled()) {
    return unavailableResult(
      "AI Verification Disabled",
      "AI evidence verification is disabled in backend configuration."
    );
  }

  if (!getGeminiApiKey()) {
    return unavailableResult(
      "AI Verification Not Configured",
      "Add GEMINI_API_KEY to backend .env to enable evidence matching."
    );
  }

  try {
    const imageBase64 =
      imageToBase64({
        imagePath,
        imageBuffer,
      });

    const response =
      await requestGemini({
        contents: [
          {
            role: "user",

            parts: [
              {
                text:
                  buildPrompt(
                    complaint
                  ),
              },

              {
                inlineData: {
                  mimeType:
                    mimeType ||
                    "image/jpeg",

                  data:
                    imageBase64,
                },
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType:
            "application/json",

          responseSchema:
            RESPONSE_SCHEMA,
        },
      });

    const outputText =
      extractGeminiText(
        response
      );

    if (!outputText) {
      const finishReason =
        response
          ?.candidates
          ?.[0]
          ?.finishReason;

      throw new Error(
        finishReason
          ? `Gemini returned no analysis. Finish reason: ${finishReason}.`
          : "Gemini returned no analysis."
      );
    }

    let parsed;

    try {
      parsed =
        JSON.parse(
          outputText
        );
    } catch {
      throw new Error(
        "Gemini returned evidence analysis that was not valid JSON."
      );
    }

    const score =
      clampScore(
        parsed.score
      );

    const confidence =
      clampScore(
        parsed.confidence
      );

    const status =
      statusFromScore(
        score
      );

    return {
      status,

      score,

      confidence,

      reviewRequired:
        score < 50,

      visualSummary:
        String(
          parsed.visualSummary ||
            "No visual summary provided."
        ).slice(
          0,
          800
        ),

      suspectedIssueType:
        String(
          parsed.suspectedIssueType ||
            "Unclear"
        ).slice(
          0,
          200
        ),

      imageQuality:
        String(
          parsed.imageQuality ||
            "Unclear"
        ).slice(
          0,
          50
        ),

      matchingFactors:
        Array.isArray(
          parsed.matchingFactors
        )
          ? parsed
              .matchingFactors
              .slice(0, 6)
              .map(
                (item) =>
                  String(item)
                    .slice(
                      0,
                      240
                    )
              )
          : [],

      mismatchFactors:
        Array.isArray(
          parsed.mismatchFactors
        )
          ? parsed
              .mismatchFactors
              .slice(0, 6)
              .map(
                (item) =>
                  String(item)
                    .slice(
                      0,
                      240
                    )
              )
          : [],

      analysisType:
        "Google Gemini multimodal evidence verification",

      provider:
        "Google Gemini",

      model:
        getEvidenceAiModel(),

      analyzedAt:
        new Date()
          .toISOString(),
    };
  } catch (error) {
    console.error(
      "⚠️ Gemini evidence verification failed:",
      error.message
    );

    return unavailableResult(
      "AI Verification Unavailable",
      "The evidence image was saved, but Gemini verification could not be completed. Admin review is required."
    );
  }
}

module.exports = {
  verifyEvidenceMatch,
  isEvidenceAiConfigured,
  getEvidenceAiModel,
};
