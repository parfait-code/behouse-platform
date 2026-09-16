import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AgencyMemberGuard } from "../agencies/guards/agency-member.guard";
import { CurrentAgencyId } from "../agencies/decorators/current-agency-id.decorator";
import { PropertiesService } from "./properties.service";
import { UpdateContactRequestStatusDto } from "./dto/update-contact-request-status.dto";
import { ContactRequestView } from "./contact-request.types";

/**
 * Dashboard agence — demandes de contact reçues via la popup "Envoyer une
 * demande" de la fiche bien (cahier des charges, 6.2.6 bis et 7.4/7.7).
 * Distinctes des réservations payées (voir AgencyBookingsController).
 */
@Controller("agency/contact-requests")
@UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
@Roles(UserRole.AGENCY_ADMIN, UserRole.AGENT)
export class AgencyContactRequestsController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(@CurrentAgencyId() agencyId: string): Promise<ContactRequestView[]> {
    return this.propertiesService.findContactRequestsForAgency(agencyId);
  }

  @Patch(":id/status")
  updateStatus(
    @CurrentAgencyId() agencyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactRequestStatusDto,
  ): Promise<ContactRequestView> {
    return this.propertiesService.updateContactRequestStatus(agencyId, id, dto);
  }
}
