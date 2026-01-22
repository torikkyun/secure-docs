import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export type Response<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "message" in data) {
          const { message, ...rest } = data as {
            message: string;
            [key: string]: unknown;
          };
          return {
            success: true,
            data: rest as T,
            message,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
