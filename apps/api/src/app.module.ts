import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AgenciesModule } from "./agencies/agencies.module";
import { PropertiesModule } from "./properties/properties.module";

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
    // Modules fonctionnels à venir (epics du planning de développement) :
    // BookingsModule, PaymentsModule...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
