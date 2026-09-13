import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";
import { AgenciesModule } from "../agencies/agencies.module";

@Module({
  imports: [AgenciesModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
