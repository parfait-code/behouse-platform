import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AgenciesController } from "./agencies.controller";
import { AdminAgenciesController } from "./admin-agencies.controller";
import { AgenciesService } from "./agencies.service";
import { AgencyMemberGuard } from "./guards/agency-member.guard";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    // Nécessaire ici pour signer le token émis directement à l'inscription
    // agence (register() dans AgenciesService), indépendamment d'AuthModule.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "7d"),
        },
      }),
    }),
  ],
  controllers: [AgenciesController, AdminAgenciesController],
  providers: [AgenciesService, AgencyMemberGuard],
  exports: [AgenciesService, AgencyMemberGuard],
})
export class AgenciesModule {}
