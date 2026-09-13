import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AgenciesModule } from "./agencies/agencies.module";
import { PropertiesModule } from "./properties/properties.module";
import { PaymentsModule } from "./payments/payments.module";
import { BookingsModule } from "./bookings/bookings.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AgenciesModule,
    PropertiesModule,
    PaymentsModule,
    BookingsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
