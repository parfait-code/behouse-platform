import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import { PropertiesService } from "./properties.service";
import { SearchPropertiesQueryDto } from "./dto/search-properties-query.dto";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { CreateContactRequestDto } from "./dto/create-contact-request.dto";
import {
  PublicPropertyDetail,
  PublicPropertyListItem,
} from "./public-property.types";

/**
 * Routes publiques du site (cahier des charges, section 6.1 et 6.2).
 * Aucune authentification requise — c'est ici que la page d'accueil
 * (= recherche) et la fiche bien iront chercher leurs données.
 */
@Controller("properties")
export class PublicPropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  search(
    @Query() query: SearchPropertiesQueryDto,
  ): Promise<PublicPropertyListItem[]> {
    return this.propertiesService.searchPublic(query);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PublicPropertyDetail> {
    return this.propertiesService.findPublicDetail(id);
  }

  @Get(":id/availability")
  getAvailability(
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: AvailabilityQueryDto,
  ): Promise<{ blockedDates: string[] }> {
    return this.propertiesService.getPublicAvailability(
      id,
      query.from,
      query.to,
    );
  }

  @Post(":id/contact-requests")
  createContactRequest(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateContactRequestDto,
  ): Promise<{ id: string }> {
    return this.propertiesService.createContactRequest(id, dto);
  }
}
