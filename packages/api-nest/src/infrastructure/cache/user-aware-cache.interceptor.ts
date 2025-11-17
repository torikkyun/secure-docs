import { CacheInterceptor } from "@nestjs/cache-manager";
import { type ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class UserAwareCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const http = context.switchToHttp();

    const req = http.getRequest<
      Request & {
        user?: {
          id: string | number;
          [key: string]: unknown;
        };
      }
    >();
    if (!["GET", "HEAD"].includes(req.method)) {
      return;
    }
    const base = req.url ?? super.trackBy(context) ?? "";
    const userId = req.user?.id;
    const auth = req.headers?.authorization;
    if (userId) {
      return `${base}:uid:${userId}`;
    }
    if (auth) {
      return `${base}:auth:${auth}`;
    }
    return base;
  }
}
