import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { QueryGroupDto } from "./dto/query-group.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { Roles } from "@/common/decorators/roles.decorator";

@Controller("api/groups")
@ApiTags("groups")
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles("admin", "manager")
  createGroup(
    @Body() dto: CreateGroupDto,
    @CurrentUser() { id, role }: AuthUser,
  ) {
    return this.groupService.createGroup(dto, id);
  }

  @Get()
  findAll(@Query() dto: QueryGroupDto, @CurrentUser() { id, role }: AuthUser) {
    return this.groupService.findAll(dto, id, role.name);
  }

  @Get(":groupId")
  findById(@Param("groupId") groupId: string) {
    return this.groupService.findById(groupId);
  }

  @Patch(":groupId")
  @Roles("admin", "manager")
  updateGroup(
    @Param("groupId") groupId: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() { id, role }: AuthUser,
  ) {
    return this.groupService.updateGroup(groupId, dto, id, role.name);
  }

  @Delete(":groupId")
  @Roles("admin", "manager")
  deleteGroup(
    @Param("groupId") groupId: string,
    @CurrentUser() { id, role }: AuthUser,
  ) {
    return this.groupService.deleteGroup(groupId, id, role.name);
  }

  @Post(":groupId/members")
  @Roles("admin", "manager")
  addMember(
    @Param("groupId") groupId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() { id, role }: AuthUser,
  ) {
    return this.groupService.addMember(groupId, dto, id, role.name);
  }

  @Delete(":groupId/members/:memberId")
  @Roles("admin", "manager")
  removeMember(
    @Param("groupId") groupId: string,
    @Param("memberId") memberId: string,
    @CurrentUser() { id, role }: AuthUser,
  ) {
    return this.groupService.removeMember(groupId, memberId, id, role.name);
  }
}
