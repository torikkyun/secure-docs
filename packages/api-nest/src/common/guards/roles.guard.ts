import { ROLES_KEY } from "@common/decorators/roles.decorator";
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly reflector: Reflector;

  constructor(reflector: Reflector) {
    this.reflector = reflector;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: { name: string } } }>();

    const hasRole = requiredRoles.some((role) => user.role.name.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        "Bạn không có quyền truy cập tài nguyên này"
      );
    }

    return true;
  }
}
