import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  url: process.env.REDIS_URL,
  ttl: Number.parseInt(process.env.CACHE_TTL!, 10),
  lruSize: Number.parseInt(process.env.CACHE_LRU_SIZE!, 10),
}));
