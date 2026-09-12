import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AgenciesService } from "./agencies.service";
import { AgencyAdminDetail, AgencySummary } from "./agency.types";
import { RejectAgencyDto } from "./dto/reject-agency.dto";

/**
 * Toutes les routes de ce contrôleur sont réservées au Super Admin Behouse
 * (cahier des charges, section 8.2 — Gestion des agences).
 */
@Controller("admin/agencies")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminAgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get()
  findAll(): Promise<AgencySummary[]> {
    return this.agenciesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<AgencyAdminDetail> {
    return this.agenciesService.findDetailOrThrow(id);
  }

  @Patch(":id/approve")
  approve(@Param("id") id: string): Promise<AgencySummary> {
    return this.agenciesService.approve(id);
  }

  @Patch(":id/reject")
  reject(
    @Param("id") id: string,
    @Body() dto: RejectAgencyDto,
  ): Promise<AgencySummary> {
    return this.agenciesService.reject(id, dto);
  }

  @Patch(":id/suspend")
  suspend(@Param("id") id: string): Promise<AgencySummary> {
    return this.agenciesService.suspend(id);
  }

  @Patch(":id/reactivate")
  reactivate(@Param("id") id: string): Promise<AgencySummary> {
    return this.agenciesService.reactivate(id);
  }
}
