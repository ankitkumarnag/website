const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const {
  connectMongo,
  getDb,
  closeMongo,
} = require("./db/mongo");

const {
  uploadEvidenceFile,
} = require("./storage/cloudinary");

const uploadsDir =
  path.join(
    __dirname,
    "uploads"
  );

function hashFile(
  filePath
) {
  const buffer =
    fs.readFileSync(
      filePath
    );

  return crypto
    .createHash(
      "sha256"
    )
    .update(
      buffer
    )
    .digest(
      "hex"
    );
}

function getLegacyFileName(
  complaint
) {
  if (
    complaint
      .evidenceLegacyLocalFileName
  ) {
    return complaint
      .evidenceLegacyLocalFileName;
  }

  if (
    complaint
      .evidenceFileName &&
    !String(
      complaint.evidenceFileName
    ).includes("/")
  ) {
    return complaint
      .evidenceFileName;
  }

  const evidenceUrl =
    String(
      complaint
        .evidenceUrl ||
        ""
    );

  if (
    evidenceUrl.startsWith(
      "/uploads/"
    )
  ) {
    return path.basename(
      evidenceUrl
    );
  }

  return "";
}

async function main() {
  let migrated = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  try {
    console.log(
      "☁️ NagarSwar local evidence → Cloudinary migration"
    );

    await connectMongo();

    const db =
      getDb();

    const complaints =
      await db
        .collection(
          "complaints"
        )
        .find({
          evidenceUrl: {
            $ne: null,
          },
        })
        .toArray();

    console.log(
      `📋 Complaints with evidence: ${complaints.length}`
    );

    for (
      const complaint of
      complaints
    ) {
      if (
        complaint
          .evidenceStorage ===
          "cloudinary" &&
        String(
          complaint
            .evidenceUrl ||
            ""
        ).startsWith(
          "https://"
        )
      ) {
        skipped += 1;
        continue;
      }

      const localFileName =
        getLegacyFileName(
          complaint
        );

      if (!localFileName) {
        console.log(
          `⚠️ ${complaint.id}: local filename not found`
        );

        missing += 1;
        continue;
      }

      const filePath =
        path.join(
          uploadsDir,
          localFileName
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        console.log(
          `⚠️ ${complaint.id}: local evidence missing (${localFileName})`
        );

        missing += 1;
        continue;
      }

      try {
        console.log(
          `⬆️ ${complaint.id}: uploading ${localFileName}`
        );

        const result =
          await uploadEvidenceFile({
            filePath,

            complaintId:
              complaint.id,

            originalName:
              complaint
                .evidenceOriginalName ||
              localFileName,
          });

        const imageHash =
          complaint
            .evidenceImageHash ||
          hashFile(
            filePath
          );

        await db
          .collection(
            "complaints"
          )
          .updateOne(
            {
              id:
                complaint.id,
            },

            {
              $set: {
                evidenceUrl:
                  result.secureUrl,

                evidenceStorage:
                  "cloudinary",

                evidencePublicId:
                  result.publicId,

                evidenceCloudinaryAssetId:
                  result.assetId,

                evidenceCloudinaryFormat:
                  result.format,

                evidenceCloudinaryWidth:
                  result.width,

                evidenceCloudinaryHeight:
                  result.height,

                evidenceUploadedAt:
                  result.createdAt,

                evidenceImageHash:
                  imageHash,

                evidenceLegacyLocalFileName:
                  localFileName,

                evidenceFileName:
                  result.publicId,

                evidenceMigratedAt:
                  new Date()
                    .toISOString(),

                updatedAt:
                  new Date()
                    .toISOString(),
              },
            }
          );

        migrated += 1;

        console.log(
          `✅ ${complaint.id}: Cloudinary migration complete`
        );
      } catch (
        error
      ) {
        failed += 1;

        console.error(
          `❌ ${complaint.id}: ${error.message}`
        );
      }
    }

    console.log("");
    console.log(
      "============== RESULT =============="
    );
    console.log(
      `✅ Migrated: ${migrated}`
    );
    console.log(
      `⏭️ Already cloud: ${skipped}`
    );
    console.log(
      `⚠️ Missing local file: ${missing}`
    );
    console.log(
      `❌ Failed: ${failed}`
    );
    console.log(
      "===================================="
    );
    console.log("");
    console.log(
      "Local files were NOT deleted. Verify the website first, then run cleanupLocalEvidence.js --confirm."
    );
  } catch (
    error
  ) {
    console.error(
      "❌ Evidence migration failed:",
      error
    );

    process.exitCode =
      1;
  } finally {
    await closeMongo();
  }
}

main();
