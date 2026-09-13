import {
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
import { BookingsService } from "./bookings.service";
import { AgencyBookingView } from "./booking.types";

/**
 * Dashboard agence — réservations (cahier des charges, section 7.4).
 * Scopé par agence via AgencyMemberGuard, comme PropertiesController.
 */
@Controller("agency/bookings")
@UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
@Roles(UserRole.AGENCY_ADMIN, UserRole.AGENT)
export class AgencyBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@CurrentAgencyId() agencyId: string): Promise<AgencyBookingView[]> {
    return this.bookingsService.findForAgency(agencyId);
  }

  @Get(":id")
  findOne(
    @CurrentAgencyId() agencyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AgencyBookingView> {
    return this.bookingsService.findOneForAgency(agencyId, id);
  }

  @Patch(":id/cancel")
  cancel(
    @CurrentAgencyId() agencyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AgencyBookingView> {
    return this.bookingsService.cancelForAgency(agencyId, id);
  }
}
