import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Injectable()
export class CacheVersionService {
  constructor(private readonly redis: RedisService) {}

  get(key: string) {
    return this.redis.getNumber(key, 1);
  }

  bump(key: string) {
    return this.redis.bumpVersion(key);
  }
}
