import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {
  private readonly cache: Cache;
  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache;
  }

  get<T>(key: string) {
    return this.cache.get<T>(key);
  }

  set(key: string, value: unknown, ttl?: number) {
    return this.cache.set(key, value, ttl ? ttl * 1000 : undefined);
  }

  del(key: string) {
    return this.cache.del(key);
  }
}
