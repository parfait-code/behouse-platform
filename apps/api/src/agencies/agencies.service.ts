import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  Agency,
  AgencyStatus,
  AuthMethod,
  Prisma,
  Property,
  UserRole,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { PublicUser } from "../users/user.types";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { RegisterAgencyDto } from "./dto/register-agency.dto";
import { RejectAgencyDto } from "./dto/reject-agency.dto";
import { UpdateAgencyProfileDto } from "./dto/update-agency-profile.dto";
import {
  AgencyAdminDetail,
  AgencyPublicProfile,
  AgencySummary,
  toAgencyAdminDetail,
  toAgencySummary,
} from "./agency.types";

const BCRYPT_SALT_ROUNDS = 10;

export interface RegisterAgencyResult {
  accessToken: string;
  user: PublicUser;
  agency: AgencySummary;
}

@Injectable()
export class AgenciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Onboarding agence (cahier des charges, section 7.1) : crée l'agence
   * (statut PENDING), son premier compte AGENCY_ADMIN, et le lien entre
   * les deux, de façon atomique. L'admin est connecté immédiatement
   * (accessToken renvoyé) mais l'agence reste invisible publiquement tant
   * qu'elle n'est pas approuvée par le Super Admin (voir approve()).
   */
  async register(dto: RegisterAgencyDto): Promise<RegisterAgencyResult> {
    const existingEmail = await this.usersService.findByEmail(dto.adminEmail);
    if (existingEmail) {
      throw new ConflictException("Un compte existe déjà avec cet email.");
    }
    const existingPhone = await this.usersService.findByPhone(dto.adminPhone);
    if (existingPhone) {
      throw new ConflictException(
        "Un compte existe déjà avec ce numéro de téléphone.",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const { agency, user } = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const createdAgency = await tx.agency.create({
          data: {
            name: dto.agencyName,
            status: AgencyStatus.PENDING,
            bankDetails: dto.bankDetails
              ? // BankDetailsDto est une classe (donc sans signature d'index),
                // alors que Prisma attend un objet JSON structurel. Le DTO est
                // déjà validé par class-validator à ce stade — cast sûr.
                (dto.bankDetails as unknown as Prisma.InputJsonValue)
              : undefined,
          },
        });

        const createdUser = await tx.user.create({
          data: {
            email: dto.adminEmail,
            phone: dto.adminPhone,
            passwordHash,
            firstName: dto.adminFirstName,
            lastName: dto.adminLastName,
            role: UserRole.AGENCY_ADMIN,
            authMethod: AuthMethod.EMAIL_PASSWORD,
          },
        });

        await tx.agencyMember.create({
          data: {
            userId: createdUser.id,
            agencyId: createdAgency.id,
            roleLabel: "admin",
          },
        });

        return { agency: createdAgency, user: createdUser };
      },
    );

    const payload: JwtPayload = { sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.toPublicUser(user),
      agency: toAgencySummary(agency),
    };
  }

  async findAll(): Promise<AgencySummary[]> {
    const agencies = await this.prisma.agency.findMany({
      orderBy: { createdAt: "desc" },
    });
    return agencies.map(toAgencySummary);
  }

  async findOneOrThrow(id: string): Promise<Agency> {
    const agency = await this.prisma.agency.findUnique({ where: { id } });
    if (!agency) {
      throw new NotFoundException("Agence introuvable.");
    }
    return agency;
  }

  async findDetailOrThrow(id: string): Promise<AgencyAdminDetail> {
    const agency = await this.findOneOrThrow(id);
    return toAgencyAdminDetail(agency);
  }

  // --- Page à propos publique (cahier des charges, 6.3) ---

  /** Récupère l'agence de l'utilisateur connecté (dashboard agence). */
  async findOwnAgency(agencyId: string): Promise<AgencySummary> {
    const agency = await this.findOneOrThrow(agencyId);
    return toAgencySummary(agency);
  }

  /**
   * Une agence non approuvée (PENDING/SUSPENDED/REJECTED) n'a pas de page
   * publique — 404 plutôt que d'exposer son statut interne.
   */
  async findPublicProfile(id: string): Promise<AgencyPublicProfile> {
    const agency = await this.findOneOrThrow(id);
    if (agency.status !== AgencyStatus.APPROVED) {
      throw new NotFoundException("Agence introuvable.");
    }

    const properties = await this.prisma.property.findMany({
      where: { agencyId: id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });

    return {
      id: agency.id,
      name: agency.name,
      description: agency.description,
      logoUrl: agency.logoUrl,
      aboutPageContent: agency.aboutPageContent,
      properties: properties.map((p: Property) => ({
        id: p.id,
        title: p.title,
        city: p.city,
        pricePerNight: p.pricePerNight.toString(),
        photos: p.photos,
        maxGuests: p.maxGuests,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
      })),
    };
  }

  /**
   * Édition de la page à propos par l'agence elle-même (cahier des
   * charges, 7.6) — réservé à l'Admin Agence, pas aux Agents (voir
   * matrice des rôles, section 4).
   */
  async updateProfile(
    agencyId: string,
    dto: UpdateAgencyProfileDto,
  ): Promise<AgencySummary> {
    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data: { ...dto },
    });
    return toAgencySummary(updated);
  }

  /** PENDING -> APPROVED (voir diagramme d'états, cahier des charges 5.5). */
  async approve(id: string): Promise<AgencySummary> {
    const agency = await this.findOneOrThrow(id);
    this.assertTransition(agency.status, AgencyStatus.PENDING, "approuver");

    const updated = await this.prisma.agency.update({
      where: { id },
      data: { status: AgencyStatus.APPROVED },
    });
    return toAgencySummary(updated);
  }

  /** PENDING -> REJECTED. */
  async reject(id: string, _dto: RejectAgencyDto): Promise<AgencySummary> {
    const agency = await this.findOneOrThrow(id);
    this.assertTransition(agency.status, AgencyStatus.PENDING, "rejeter");

    // Le motif (dto.reason) est à transmettre par email à l'agence une fois
    // le module Notifications construit (V1) — non bloquant pour le MVP.
    const updated = await this.prisma.agency.update({
      where: { id },
      data: { status: AgencyStatus.REJECTED },
    });
    return toAgencySummary(updated);
  }

  /** APPROVED -> SUSPENDED. */
  async suspend(id: string): Promise<AgencySummary> {
    const agency = await this.findOneOrThrow(id);
    this.assertTransition(agency.status, AgencyStatus.APPROVED, "suspendre");

    const updated = await this.prisma.agency.update({
      where: { id },
      data: { status: AgencyStatus.SUSPENDED },
    });
    return toAgencySummary(updated);
  }

  /** SUSPENDED -> APPROVED. */
  async reactivate(id: string): Promise<AgencySummary> {
    const agency = await this.findOneOrThrow(id);
    this.assertTransition(agency.status, AgencyStatus.SUSPENDED, "réactiver");

    const updated = await this.prisma.agency.update({
      where: { id },
      data: { status: AgencyStatus.APPROVED },
    });
    return toAgencySummary(updated);
  }

  private assertTransition(
    currentStatus: AgencyStatus,
    requiredStatus: AgencyStatus,
    action: string,
  ): void {
    if (currentStatus !== requiredStatus) {
      throw new BadRequestException(
        `Impossible de ${action} une agence au statut "${currentStatus}" (statut requis : "${requiredStatus}").`,
      );
    }
  }
}
