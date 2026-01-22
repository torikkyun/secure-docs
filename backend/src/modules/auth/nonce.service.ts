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
