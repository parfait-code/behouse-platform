import { Body, Controller, Post } from "@nestjs/common";
import { AgenciesService, RegisterAgencyResult } from "./agencies.service";
import { RegisterAgencyDto } from "./dto/register-agency.dto";

@Controller("agencies")
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post("register")
  register(@Body() dto: RegisterAgencyDto): Promise<RegisterAgencyResult> {
    return this.agenciesService.register(dto);
  }
}
