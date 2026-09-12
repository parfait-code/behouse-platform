import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AgencyMemberGuard } from "../agencies/guards/agency-member.guard";
import { CurrentAgencyId } from "../agencies/decorators/current-agency-id.decorator";
import { PropertiesService } from "./properties.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { SetAvailabilityDto } from "./dto/set-availability.dto";
import { PropertyView } from "./property.types";

/**
 * Dashboard agence — gestion des biens (cahier des charges, section 7.3).
 * Chaque route est scopée à l'agence de l'utilisateur connecté via
 * AgencyMemberGuard + CurrentAgencyId (voir documentation technique,
 * section 5 — Multi-tenance applicative).
 */
@Controller("agency/properties")
@UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
@Roles(UserRole.AGENCY_ADMIN, UserRole.AGENT)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(
    @CurrentAgencyId() agencyId: string,
    @Body() dto: CreatePropertyDto,
  ): Promise<PropertyView> {
    return this.propertiesService.create(agencyId, dto);
  }

  @Get()
  findAll(@CurrentAgencyId() agencyId: string): Promise<PropertyView[]> {
    return this.propertiesService.findAllForAgency(agencyId);
  }

  @Get(":id")
  findOne(
    @CurrentAgencyId() agencyId: string,
    @Param("id") id: string,
  ): Promise<PropertyView> {
    return this.propertiesService.findOneForAgency(agencyId, id);
  }

  @Patch(":id")
  update(
    @CurrentAgencyId() agencyId: string,
    @Param("id") id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<PropertyView> {
    return this.propertiesService.update(agencyId, id, dto);
  }

  @Patch(":id/publish")
  publish(
    @CurrentAgencyId() agencyId: string,
    @Param("id") id: string,
  ): Promise<PropertyView> {
    return this.propertiesService.publish(agencyId, id);
  }

  @Patch(":id/unpublish")
  unpublish(
    @CurrentAgencyId() agencyId: string,
    @Param("id") id: string,
  ): Promise<PropertyView> {
    return this.propertiesService.unpublish(agencyId, id);
  }

  @Patch(":id/availability")
  setAvailability(
    @CurrentAgencyId() agencyId: string,
    @Param("id") id: string,
    @Body() dto: SetAvailabilityDto,
  ): Promise<{ updated: number }> {
    return this.propertiesService.setAvailability(agencyId, id, dto);
  }
}
