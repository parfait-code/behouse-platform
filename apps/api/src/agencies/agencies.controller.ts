import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AgencyMemberGuard } from "./guards/agency-member.guard";
import { CurrentAgencyId } from "./decorators/current-agency-id.decorator";
import { AgenciesService, RegisterAgencyResult } from "./agencies.service";
import { RegisterAgencyDto } from "./dto/register-agency.dto";
import { UpdateAgencyProfileDto } from "./dto/update-agency-profile.dto";
import { AgencyPublicProfile, AgencySummary } from "./agency.types";

@Controller("agencies")
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post("register")
  register(@Body() dto: RegisterAgencyDto): Promise<RegisterAgencyResult> {
    return this.agenciesService.register(dto);
  }

  /**
   * Récupère l'agence de l'utilisateur connecté (dashboard agence, tous
   * rôles agence confondus — seule l'édition est réservée à l'Admin).
   */
  @Get("profile")
  @UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
  @Roles(UserRole.AGENCY_ADMIN, UserRole.AGENT)
  getMyAgency(@CurrentAgencyId() agencyId: string): Promise<AgencySummary> {
    return this.agenciesService.findOwnAgency(agencyId);
  }

  /**
   * Édition de la page à propos par l'agence (cahier des charges, 7.6).
   * Route déclarée avant `:id` : "profile" est un segment littéral, mais
   * ordonner explicitement évite toute ambiguïté de matching de route.
   */
  @Patch("profile")
  @UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
  @Roles(UserRole.AGENCY_ADMIN)
  updateProfile(
    @CurrentAgencyId() agencyId: string,
    @Body() dto: UpdateAgencyProfileDto,
  ): Promise<AgencySummary> {
    return this.agenciesService.updateProfile(agencyId, dto);
  }

  /** Page à propos publique (cahier des charges, 6.3). */
  @Get(":id")
  findPublicProfile(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AgencyPublicProfile> {
    return this.agenciesService.findPublicProfile(id);
  }
}
