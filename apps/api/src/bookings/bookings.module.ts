import { Module } from "@nestjs/common";
import { BookingsController } from "./bookings.controller";
import { AgencyBookingsController } from "./agency-bookings.controller";
import { AdminBookingsController } from "./admin-bookings.controller";
import { BookingsService } from "./bookings.service";
import { PaymentsModule } from "../payments/payments.module";
import { AgenciesModule } from "../agencies/agencies.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PaymentsModule, AgenciesModule, NotificationsModule],
  controllers: [
    BookingsController,
    AgencyBookingsController,
    AdminBookingsController,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
