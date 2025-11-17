import * as bcrypt from "bcrypt";

export function hashPassword(password: string, saltRounds = 10): string {
  return bcrypt.hashSync(password, saltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
