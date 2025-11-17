import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  error(message: string, stack?: string, context?: string) {
    // Add custom logging logic here (e.g., send to external service)
    super.error(message, stack, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
  }
}
