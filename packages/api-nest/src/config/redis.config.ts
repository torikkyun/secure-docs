import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ttl: Number.parseInt(process.env.CACHE_TTL || "600", 10),
  lruSize: Number.parseInt(process.env.CACHE_LRU_SIZE || "100", 10),
}));
