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

  async deleteByPattern(pattern: string) {
    try {
      const store = this.cache.stores[0];

      if (!store || typeof store.iterator !== "function") {
        console.warn("Redis store not available");
        return;
      }

      const keysToDelete: string[] = [];

      for await (const [key] of store.iterator({})) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length > 0) {
        await Promise.all(
          keysToDelete.map((key: string) => this.cache.del(key)),
        );
      }
    } catch (error) {
      console.error("Error deleting cache by pattern:", error);
    }
  }

  async clear() {
    return this.cache.clear();
  }
}
