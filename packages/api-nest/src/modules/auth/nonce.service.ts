import { Injectable } from "@nestjs/common";
import { generateNonce } from "siwe";
import { RedisService } from "src/infrastructure/cache/redis.service";

@Injectable()
export class NonceService {
  private readonly redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
  }

  private keyFor(walletAddress: string) {
    return `nonce:${walletAddress.toLowerCase()}`;
  }

  async createNonceFor(walletAddress: string, ttlSeconds = 3600) {
    // Use a SIWE-compatible nonce (short alphanumeric), not a UUID.
    // The SIWE library expects a nonce of a specific format and will
    // generate its own if the provided nonce doesn't match. Using
    // `generateNonce` keeps client and server in sync.
    const nonce = generateNonce();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const key = this.keyFor(walletAddress);
    await this.redisService.set(key, nonce, ttlSeconds);
    return { nonce, expiresAt };
  }

  async getNonceFor(walletAddress: string) {
    const key = this.keyFor(walletAddress);
    const nonce = await this.redisService.get<string>(key);
    return nonce ? { nonce } : null;
  }

  async markNonceUsed(walletAddress: string) {
    const key = this.keyFor(walletAddress);
    await this.redisService.del(key);
  }
}
