import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { BookingsService } from "./bookings.service";
import { AdminBookingView, CommissionSummary } from "./booking.types";

/**
 * Dashboard Behouse — supervision globale (cahier des charges, 8.1/8.5).
 * Réservé au Super Admin, toutes agences confondues.
 */
@Controller("admin/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(): Promise<AdminBookingView[]> {
    return this.bookingsService.findAllForAdmin();
  }

  @Get("commissions/summary")
  getCommissionSummary(): Promise<CommissionSummary> {
    return this.bookingsService.getCommissionSummary();
  }
}
