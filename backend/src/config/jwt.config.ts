import { registerAs } from "@nestjs/config";
import type { StringValue } from "ms";

export default registerAs(
  "jwt",
  (): {
    secret: string;
    expiration: StringValue;
  } => ({
    secret: process.env.JWT_SECRET!,
    expiration: process.env.JWT_EXPIRATION as StringValue,
  }),
);
