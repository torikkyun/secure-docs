import { createHash } from "crypto";

export class CacheKeyFactory {
  static hashQuery(query: unknown): string {
    return createHash("sha1").update(JSON.stringify(query)).digest("hex");
  }

  static usersList(version: number, query: unknown) {
    return `users:list:v${version}:${this.hashQuery(query)}`;
  }

  static userProfile(userId: string | number, version: number) {
    return `users:profile:${userId}:v${version}`;
  }
}
