import { registerAs } from "@nestjs/config";

export default registerAs("database", (): { url: string } => ({
  url: process.env.DATABASE_URL as string,
}));
