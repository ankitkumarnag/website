const dotenv = require("dotenv");

dotenv.config();

const {
  testCloudinaryConnection,
} = require("./storage/cloudinary");

function getErrorMessage(
  error
) {
  if (!error) {
    return "Unknown Cloudinary error";
  }

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  return (
    error.message ||
    error.error?.message ||
    error.error?.http_code ||
    JSON.stringify(
      error
    )
  );
}

async function main() {
  try {
    const result =
      await testCloudinaryConnection();

    console.log(
      "✅ Cloudinary connected successfully"
    );

    console.log(
      "✅ Upload permission: WORKING"
    );

    console.log(
      "✅ Test cleanup: requested"
    );

    console.log(
      "✅ Status =",
      result.status
    );
  } catch (
    error
  ) {
    console.error(
      "❌ Cloudinary connection failed:",
      getErrorMessage(
        error
      )
    );

    console.error(
      "Error details:",
      error
    );

    process.exitCode =
      1;
  }
}

main();
