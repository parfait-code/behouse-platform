import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AgencyStatus, Property, PropertyStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { SetAvailabilityDto } from "./dto/set-availability.dto";
import { SearchPropertiesQueryDto } from "./dto/search-properties-query.dto";
import { CreateContactRequestDto } from "./dto/create-contact-request.dto";
import { PropertyView, toPropertyView } from "./property.types";
import {
  PublicPropertyDetail,
  PublicPropertyListItem,
  toPublicPropertyDetail,
  toPublicPropertyListItem,
} from "./public-property.types";

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
        maxGuests: dto.maxGuests,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        beds: dto.beds,
        photos: dto.photos ?? [],
        amenities: dto.amenities ?? [],
        houseRules: dto.houseRules as Prisma.InputJsonValue | undefined,
        checkInTime: dto.checkInTime,
        checkOutTime: dto.checkOutTime,
        cancellationPolicyOverride: dto.cancellationPolicyOverride as
          Prisma.InputJsonValue | undefined,
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
      data: {
        ...dto,
        // Mêmes casts que create() : Prisma exige InputJsonValue, plus
        // strict que Record<string, unknown>/Record<string, boolean>.
        houseRules: dto.houseRules as Prisma.InputJsonValue | undefined,
        cancellationPolicyOverride: dto.cancellationPolicyOverride as
          Prisma.InputJsonValue | undefined,
      },
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

  // --- Recherche publique (site public, cahier des charges 6.1 / 6.2) ---

  /**
   * Page d'accueil = page de recherche (cahier des charges, 6.1). Seuls les
   * biens PUBLISHED apparaissent, toutes agences confondues. Si checkIn ET
   * checkOut sont fournis, exclut les biens ayant au moins une date bloquée
   * dans l'intervalle demandé.
   */
  async searchPublic(
    query: SearchPropertiesQueryDto,
  ): Promise<PublicPropertyListItem[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        // Une agence non approuvée (PENDING/SUSPENDED/REJECTED) ne doit
        // jamais apparaître publiquement, même si ses biens sont publiés
        // (bug corrigé : ce filtre manquait, contournant le circuit de
        // validation Super Admin).
        agency: { status: AgencyStatus.APPROVED },
        city: query.city
          ? { equals: query.city, mode: "insensitive" }
          : undefined,
        maxGuests: query.guests ? { gte: query.guests } : undefined,
        bedrooms: query.bedrooms ? { gte: query.bedrooms } : undefined,
        bathrooms: query.bathrooms ? { gte: query.bathrooms } : undefined,
        pricePerNight: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
        ...(query.amenities && query.amenities.length > 0
          ? {
              AND: query.amenities.map((amenity) => ({
                amenities: { array_contains: amenity },
              })),
            }
          : {}),
        ...(query.checkIn && query.checkOut
          ? {
              availabilities: {
                none: {
                  isBlocked: true,
                  date: {
                    gte: new Date(query.checkIn),
                    lt: new Date(query.checkOut),
                  },
                },
              },
            }
          : {}),
      },
      include: { agency: true },
      orderBy: { createdAt: "desc" },
    });

    return properties.map(toPublicPropertyListItem);
  }

  /**
   * Fiche bien publique (cahier des charges, 6.2). Un bien non publié
   * renvoie 404 même s'il existe, pour ne pas exposer les brouillons des
   * agences.
   */
  async findPublicDetail(propertyId: string): Promise<PublicPropertyDetail> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { agency: true },
    });

    if (
      !property ||
      property.status !== PropertyStatus.PUBLISHED ||
      property.agency.status !== AgencyStatus.APPROVED
    ) {
      throw new NotFoundException("Bien introuvable.");
    }

    return toPublicPropertyDetail(property);
  }

  /**
   * Dates bloquées d'un bien sur une période donnée — alimente le
   * calendrier de la fiche bien (cahier des charges, 6.2.6). Ne renvoie
   * que les dates bloquées, pas tout le calendrier.
   */
  async getPublicAvailability(
    propertyId: string,
    from: string,
    to: string,
  ): Promise<{ blockedDates: string[] }> {
    // Vérifie que le bien est bien publié avant d'exposer son calendrier.
    await this.findPublicDetail(propertyId);

    const rows = await this.prisma.availability.findMany({
      where: {
        propertyId,
        isBlocked: true,
        date: { gte: new Date(from), lt: new Date(to) },
      },
      select: { date: true },
    });

    return {
      blockedDates: rows.map(
        (row: { date: Date }) => row.date.toISOString().split("T")[0] as string,
      ),
    };
  }

  /**
   * Popup "Envoyer une demande" (cahier des charges, 6.2.6 bis) — crée une
   * demande de contact sans exiger de compte locataire. À afficher dans les
   * leads du dashboard agence une fois ce module construit (7.4/7.7).
   */
  async createContactRequest(
    propertyId: string,
    dto: CreateContactRequestDto,
  ): Promise<{ id: string }> {
    // Vérifie que le bien est publié (lève 404 sinon), sans exposer le
    // reste de la fiche ici.
    await this.findPublicDetail(propertyId);

    const contactRequest = await this.prisma.contactRequest.create({
      data: {
        propertyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        requestedStartDate: dto.requestedStartDate
          ? new Date(dto.requestedStartDate)
          : undefined,
        requestedEndDate: dto.requestedEndDate
          ? new Date(dto.requestedEndDate)
          : undefined,
        specialRequests: dto.specialRequests,
      },
    });

    return { id: contactRequest.id };
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
