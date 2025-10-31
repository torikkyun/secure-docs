import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface SuccessResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T | null;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => {
        let message: string | undefined;
        let responseData: T | null = null;

        if (data === null || data === undefined) {
          responseData = {} as T;
        } else if (Array.isArray(data)) {
          responseData = data as T;
        } else if (typeof data === 'object' && data !== null) {
          const typedData = data as Record<string, unknown>;
          message = typedData.message as string;
          const { message: _, ...rest } = typedData;
          responseData = Object.keys(rest).length > 0 ? (rest as T) : null;
        } else {
          responseData = data as T;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          ...(message && { message }),
          data: responseData,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
