import type { Cache } from "cache-manager";
import { hashObject } from "src/common/utils/hash.util";

export interface VersionedCacheOptions {
  /** prefix của cache key, ví dụ: users:list */
  prefix: string;

  /**
   * version key trong redis
   * - string: cố định
   * - function: build từ args
   */
  versionKey: string | ((args: any[]) => string);

  /** TTL (giây) */
  ttl?: number;

  /**
   * Custom key generator từ args
   * Mặc định sẽ hash toàn bộ args
   */
  key?: (args: any[]) => unknown;
}

export function VersionedCache(options: VersionedCacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache: Cache | undefined = this.cache || this.cacheManager;

      if (!cache) {
        return originalMethod.apply(this, args);
      }

      const versionKey =
        typeof options.versionKey === "function"
          ? options.versionKey(args)
          : options.versionKey;

      const version = (await cache.get<number>(versionKey)) ?? 1;

      const keyPayload = options.key ? options.key(args) : args;
      const hash = hashObject(keyPayload);
      const cacheKey = `${options.prefix}:v${version}:${hash}`;

      const cached = await cache.get(cacheKey);
      if (cached !== undefined && cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);

      if (result !== undefined && result !== null) {
        await cache.set(cacheKey, result, options.ttl);
      }

      return result;
    };

    return descriptor;
  };
}
