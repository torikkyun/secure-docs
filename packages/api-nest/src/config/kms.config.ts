import { registerAs } from "@nestjs/config";

export default registerAs("kms", () => ({
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpKmsLocation: process.env.GCP_KMS_LOCATION,
  gcpKmsKeyRing: process.env.GCP_KMS_KEYRING,
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
}));
