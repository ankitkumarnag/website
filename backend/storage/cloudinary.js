const path = require("path");
const {
  v2: cloudinary,
} = require("cloudinary");

let configured = false;

function getCloudinaryConfig() {
  return {
    cloudName:
      String(
        process.env.CLOUDINARY_CLOUD_NAME ||
          ""
      ).trim(),

    apiKey:
      String(
        process.env.CLOUDINARY_API_KEY ||
          ""
      ).trim(),

    apiSecret:
      String(
        process.env.CLOUDINARY_API_SECRET ||
          ""
      ).trim(),
  };
}

function isCloudinaryConfigured() {
  const {
    cloudName,
    apiKey,
    apiSecret,
  } =
    getCloudinaryConfig();

  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret
  );
}

function ensureConfigured() {
  if (configured) {
    return;
  }

  const {
    cloudName,
    apiKey,
    apiSecret,
  } =
    getCloudinaryConfig();

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret
  ) {
    throw new Error(
      "Cloudinary credentials are missing from backend/.env"
    );
  }

  cloudinary.config({
    cloud_name:
      cloudName,

    api_key:
      apiKey,

    api_secret:
      apiSecret,

    secure: true,
  });

  configured = true;
}

function sanitizePublicId(
  value
) {
  return String(
    value || "evidence"
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .slice(
      0,
      100
    );
}

function mapUploadResult(
  result
) {
  return {
    secureUrl:
      result.secure_url,

    publicId:
      result.public_id,

    assetId:
      result.asset_id ||
      null,

    format:
      result.format ||
      null,

    width:
      result.width ??
      null,

    height:
      result.height ??
      null,

    bytes:
      result.bytes ??
      null,

    createdAt:
      result.created_at ||
      new Date()
        .toISOString(),
  };
}

async function uploadEvidenceBuffer({
  buffer,
  complaintId,
  originalName,
}) {
  ensureConfigured();

  if (
    !Buffer.isBuffer(
      buffer
    )
  ) {
    throw new Error(
      "Evidence upload buffer is missing."
    );
  }

  const originalBaseName =
    path
      .basename(
        String(
          originalName ||
            "evidence"
        ),
        path.extname(
          String(
            originalName ||
              ""
          )
        )
      );

  const publicId =
    `${sanitizePublicId(
      complaintId
    )}-${Date.now()}-${sanitizePublicId(
      originalBaseName
    )}`;

  const result =
    await new Promise(
      (
        resolve,
        reject
      ) => {
        const stream =
          cloudinary.uploader
            .upload_stream(
              {
                folder:
                  "nagarswar/evidence",

                public_id:
                  publicId,

                resource_type:
                  "image",

                overwrite:
                  false,

                unique_filename:
                  false,
              },

              (
                error,
                uploadResult
              ) => {
                if (error) {
                  reject(
                    error
                  );

                  return;
                }

                resolve(
                  uploadResult
                );
              }
            );

        stream.end(
          buffer
        );
      }
    );

  return mapUploadResult(
    result
  );
}

async function uploadEvidenceFile({
  filePath,
  complaintId,
  originalName,
}) {
  ensureConfigured();

  const originalBaseName =
    path
      .basename(
        String(
          originalName ||
            filePath ||
            "evidence"
        ),
        path.extname(
          String(
            originalName ||
              filePath ||
              ""
          )
        )
      );

  const publicId =
    `${sanitizePublicId(
      complaintId
    )}-legacy-${sanitizePublicId(
      originalBaseName
    )}`;

  const result =
    await cloudinary.uploader
      .upload(
        filePath,
        {
          folder:
            "nagarswar/evidence",

          public_id:
            publicId,

          resource_type:
            "image",

          overwrite:
            true,

          unique_filename:
            false,
        }
      );

  return mapUploadResult(
    result
  );
}

async function testCloudinaryConnection() {
  ensureConfigured();

  /*
    Use the Upload API itself for the health check instead of
    cloudinary.api.ping().

    This tests the exact permission NagarSwar needs:
    authenticated image upload.

    A tiny 1x1 PNG is uploaded and immediately deleted.
  */

  const transparentPixel =
    "data:image/png;base64," +
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" +
    "CAQAAAC1HAwCAAAAC0lEQVR42mNk" +
    "YAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const publicId =
    `connection-test-${Date.now()}`;

  let uploadedPublicId = null;

  try {
    const result =
      await cloudinary.uploader
        .upload(
          transparentPixel,
          {
            folder:
              "nagarswar/system",

            public_id:
              publicId,

            resource_type:
              "image",

            overwrite:
              true,

            unique_filename:
              false,
          }
        );

    uploadedPublicId =
      result.public_id;

    if (
      !result.secure_url
    ) {
      throw new Error(
        "Cloudinary upload completed without a secure URL."
      );
    }

    return {
      status:
        "ok",

      secureUrl:
        result.secure_url,

      publicId:
        result.public_id,
    };
  } finally {
    if (
      uploadedPublicId
    ) {
      try {
        await cloudinary.uploader
          .destroy(
            uploadedPublicId,
            {
              resource_type:
                "image",
            }
          );
      } catch (
        cleanupError
      ) {
        console.warn(
          "⚠️ Cloudinary test image cleanup warning:",
          cleanupError?.message ||
            String(
              cleanupError
            )
        );
      }
    }
  }
}

module.exports = {
  isCloudinaryConfigured,
  uploadEvidenceBuffer,
  uploadEvidenceFile,
  testCloudinaryConnection,
};
