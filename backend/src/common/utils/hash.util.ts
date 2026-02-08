import * as bcrypt from "bcrypt";
import { createHash } from "crypto";

export function hashObject(value: unknown): string {
  return createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

export function hashPassword(password: string, saltRounds = 10): string {
  return bcrypt.hashSync(password, saltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
