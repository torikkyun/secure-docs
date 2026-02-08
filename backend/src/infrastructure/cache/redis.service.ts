import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  get<T>(key: string) {
    return this.cache.get<T>(key);
  }

  set(key: string, value: unknown, ttl?: number) {
    return this.cache.set(key, value, ttl);
  }

  del(key: string) {
    return this.cache.del(key);
  }

  async clear() {
    return this.cache.clear();
  }

  async getNumber(key: string, defaultValue = 1): Promise<number> {
    const value = await this.cache.get<number>(key);
    return typeof value === "number" ? value : defaultValue;
  }

  async bumpVersion(key: string): Promise<number> {
    const current = await this.getNumber(key, 1);
    const next = current + 1;
    await this.cache.set(key, next);
    return next;
  }
}
