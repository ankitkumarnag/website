const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/*
  =========================================================
  NAGARSWAR AI
  REUSED EVIDENCE IMAGE DETECTION
  =========================================================

  Current version uses SHA-256 file fingerprinting.

  Detects:
  - Exact same image file uploaded again.

  Does not yet detect:
  - Cropped versions
  - Screenshots
  - Edited/recompressed versions

  Those will need perceptual image similarity later.
*/

function createBufferHash(
  fileBuffer
) {
  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");
}

function createFileHash(
  filePath
) {
  const fileBuffer =
    fs.readFileSync(
      filePath
    );

  return createBufferHash(
    fileBuffer
  );
}

function getExistingComplaintHash(
  complaint,
  uploadsDir
) {
  if (complaint.evidenceImageHash) {
    return complaint.evidenceImageHash;
  }

  if (!complaint.evidenceFileName) {
    return null;
  }

  const existingFilePath =
    path.join(
      uploadsDir,
      complaint.evidenceFileName
    );

  if (!fs.existsSync(existingFilePath)) {
    return null;
  }

  try {
    return createFileHash(
      existingFilePath
    );
  } catch (error) {
    console.error(
      `⚠️ Could not fingerprint evidence for ${complaint.id}:`,
      error.message
    );

    return null;
  }
}

function analyzeImageReuse({
  uploadedFilePath,
  uploadedFileBuffer,
  complaints,
  uploadsDir,
}) {
  const evidenceHash =
    Buffer.isBuffer(
      uploadedFileBuffer
    )
      ? createBufferHash(
          uploadedFileBuffer
        )
      : uploadedFilePath
        ? createFileHash(
            uploadedFilePath
          )
        : null;

  if (!evidenceHash) {
    throw new Error(
      "No evidence data available for reused-image detection."
    );
  }

  const matchedComplaintIds = [];

  for (const complaint of complaints) {
    const existingHash =
      getExistingComplaintHash(
        complaint,
        uploadsDir
      );

    if (
      existingHash &&
      existingHash === evidenceHash
    ) {
      matchedComplaintIds.push(
        complaint.id
      );
    }
  }

  const isReused =
    matchedComplaintIds.length > 0;

  return {
    evidenceHash,
    isReused,
    matchedComplaintIds,
    matchCount:
      matchedComplaintIds.length,
    status: isReused
      ? "Reused Evidence Detected"
      : "Unique Evidence",
    detectionType:
      "SHA-256 exact file fingerprint",
  };
}

module.exports = {
  analyzeImageReuse,
  createBufferHash,
  createFileHash,
};
