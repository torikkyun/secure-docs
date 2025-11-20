import { registerAs } from "@nestjs/config";

export default registerAs("siwe", () => ({
  registerDomain: process.env.REGISTER_DOMAIN,
}));
