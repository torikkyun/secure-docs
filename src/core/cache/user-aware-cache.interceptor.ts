import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';

@Injectable()
export class UserAwareCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const http = context.switchToHttp();

    interface UserWithId {
      id: string | number;
      [key: string]: any;
    }
    const req = http.getRequest<Request & { user?: UserWithId }>();
    if (!['GET', 'HEAD'].includes(req.method)) {
      return undefined;
    }
    const base = req.url ?? super.trackBy(context) ?? '';
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
