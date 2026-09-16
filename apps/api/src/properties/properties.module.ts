import { Module } from "@nestjs/common";
import { PropertiesController } from "./properties.controller";
import { PublicPropertiesController } from "./public-properties.controller";
import { AgencyContactRequestsController } from "./agency-contact-requests.controller";
import { PropertiesService } from "./properties.service";
import { AgenciesModule } from "../agencies/agencies.module";

@Module({
  imports: [AgenciesModule],
  controllers: [
    PropertiesController,
    PublicPropertiesController,
    AgencyContactRequestsController,
  ],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
