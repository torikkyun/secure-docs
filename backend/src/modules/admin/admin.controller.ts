import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseBoolPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { QueryAlertDto } from "./dto/query-alert.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { ResolveAlertDto } from "./dto/resolve-alert.dto";
import { QueryLoginActivityDto } from "./dto/query-login-activity.dto";
import { Roles } from "@/common/decorators/roles.decorator";

@Controller("api/admin")
@ApiTags("admin")
@ApiBearerAuth()
@Roles("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  getUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("status") status?: "active" | "banned",
    @Query("sortBy") sortBy?: "name" | "createdAt" | "ownedFiles",
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ) {
    return this.adminService.getUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      role,
      status,
      sortBy,
      sortOrder,
    });
  }

  @Get("users/:userId")
  getUserDetail(@Param("userId") userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Patch("users/:userId/role")
  updateUserRole(
    @Param("userId") userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto);
  }

  @Patch("users/:userId/ban")
  banUser(
    @Param("userId") userId: string,
    @Body("isBanned", ParseBoolPipe) isBanned: boolean,
  ) {
    return this.adminService.toggleBan(userId, isBanned);
  }

  @Get("alerts")
  getAlerts(@Query() dto: QueryAlertDto) {
    return this.adminService.getAlerts(dto);
  }

  @Get("alerts/unresolved-count")
  getUnresolvedAlertCount() {
    return this.adminService.getUnresolvedAlertCount();
  }

  @Patch("alerts/:alertId/resolve")
  resolveAlert(
    @Param("alertId") alertId: string,
    @Body() dto: ResolveAlertDto,
  ) {
    return this.adminService.resolveAlert(alertId, dto);
  }

  @Get("login-activities")
  getLoginActivities(@Query() dto: QueryLoginActivityDto) {
    return this.adminService.getLoginActivities(dto);
  }
}
