import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    // Modules fonctionnels à venir (epics du planning de développement) :
    // AuthModule, AgenciesModule, PropertiesModule, BookingsModule,
    // PaymentsModule, UsersModule...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
