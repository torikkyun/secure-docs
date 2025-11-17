import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "your_jwt_secret",
  expiration: process.env.JWT_EXPIRATION || "1h",
}));
