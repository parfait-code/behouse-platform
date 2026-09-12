import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Property, PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { SetAvailabilityDto } from "./dto/set-availability.dto";
import { PropertyView, toPropertyView } from "./property.types";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    agencyId: string,
    dto: CreatePropertyDto,
  ): Promise<PropertyView> {
    const property = await this.prisma.property.create({
      data: {
        agencyId,
        title: dto.title,
        description: dto.description,
        propertyType: dto.propertyType,
        address: dto.address,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        pricePerNight: dto.pricePerNight,
        photos: dto.photos ?? [],
        amenities: dto.amenities ?? [],
        houseRules: dto.houseRules,
        checkInTime: dto.checkInTime,
        checkOutTime: dto.checkOutTime,
        cancellationPolicyOverride: dto.cancellationPolicyOverride,
        status: PropertyStatus.DRAFT,
      },
    });
    return toPropertyView(property);
  }

  async findAllForAgency(agencyId: string): Promise<PropertyView[]> {
    const properties = await this.prisma.property.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });
    return properties.map(toPropertyView);
  }

  async findOneForAgency(
    agencyId: string,
    propertyId: string,
  ): Promise<PropertyView> {
    const property = await this.findOwnedOrThrow(agencyId, propertyId);
    return toPropertyView(property);
  }

  async update(
    agencyId: string,
    propertyId: string,
    dto: UpdatePropertyDto,
  ): Promise<PropertyView> {
    await this.findOwnedOrThrow(agencyId, propertyId);

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { ...dto },
    });
    return toPropertyView(updated);
  }

  /**
   * Publication directe (pas de modération préalable, cahier des charges
   * section 0) — mais on vérifie tout de même le minimum requis pour une
   * fiche exploitable : au moins une photo (prix et adresse sont déjà
   * obligatoires à la création).
   */
  async publish(agencyId: string, propertyId: string): Promise<PropertyView> {
    const property = await this.findOwnedOrThrow(agencyId, propertyId);

    const photos = Array.isArray(property.photos) ? property.photos : [];
    if (photos.length === 0) {
      throw new BadRequestException(
        "Ajoutez au moins une photo avant de publier ce bien.",
      );
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.PUBLISHED },
    });
    return toPropertyView(updated);
  }

  async unpublish(agencyId: string, propertyId: string): Promise<PropertyView> {
    await this.findOwnedOrThrow(agencyId, propertyId);

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.UNPUBLISHED },
    });
    return toPropertyView(updated);
  }

  /**
   * Bloque/débloque une liste de dates (cahier des charges, 7.3 —
   * calendrier de disponibilité). Upsert : crée l'entrée si elle n'existe
   * pas encore pour cette date.
   */
  async setAvailability(
    agencyId: string,
    propertyId: string,
    dto: SetAvailabilityDto,
  ): Promise<{ updated: number }> {
    await this.findOwnedOrThrow(agencyId, propertyId);

    await this.prisma.$transaction(
      dto.dates.map((date) =>
        this.prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId,
              date: new Date(date),
            },
          },
          create: {
            propertyId,
            date: new Date(date),
            isBlocked: dto.isBlocked,
          },
          update: { isBlocked: dto.isBlocked },
        }),
      ),
    );

    return { updated: dto.dates.length };
  }

  /**
   * Vérifie que le bien appartient bien à l'agence de l'utilisateur
   * connecté. Renvoie 404 (et non 403) pour ne pas révéler l'existence
   * d'un bien appartenant à une autre agence.
   */
  private async findOwnedOrThrow(
    agencyId: string,
    propertyId: string,
  ): Promise<Property> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property || property.agencyId !== agencyId) {
      throw new NotFoundException("Bien introuvable.");
    }
    return property;
  }
}
