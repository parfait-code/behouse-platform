import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, ConflictException } from "@nestjs/common";
import {
  Agency,
  AgencyStatus,
  AuthMethod,
  User,
  UserRole,
} from "@prisma/client";
import { AgenciesService } from "./agencies.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";

const buildAgency = (overrides: Partial<Agency> = {}): Agency => ({
  id: "agency-1",
  name: "Agence Test",
  description: null,
  logoUrl: null,
  aboutPageContent: null,
  status: AgencyStatus.PENDING,
  commissionRate: {
    toString: () => "0.10",
  } as unknown as Agency["commissionRate"],
  bankDetails: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "admin@agence-test.com",
  phone: "+237600000000",
  passwordHash: "hashed",
  googleId: null,
  authMethod: AuthMethod.EMAIL_PASSWORD,
  role: UserRole.AGENCY_ADMIN,
  firstName: "Jean",
  lastName: "Dupont",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("AgenciesService", () => {
  let service: AgenciesService;
  let usersService: jest.Mocked<
    Pick<UsersService, "findByEmail" | "findByPhone" | "toPublicUser">
  >;
  let prisma: {
    $transaction: jest.Mock;
    agency: { findUnique: jest.Mock; update: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      toPublicUser: jest.fn((user: User) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: user.authMethod,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      })),
    };

    prisma = {
      $transaction: jest.fn(),
      agency: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgenciesService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue("signed-jwt-token") },
        },
      ],
    }).compile();

    service = module.get<AgenciesService>(AgenciesService);
  });

  describe("register", () => {
    it("crée l'agence, l'admin, et renvoie un access token", async () => {
      const agency = buildAgency();
      const user = buildUser();
      prisma.$transaction.mockResolvedValue({ agency, user });

      const result = await service.register({
        agencyName: "Agence Test",
        adminFirstName: "Jean",
        adminLastName: "Dupont",
        adminEmail: "admin@agence-test.com",
        adminPhone: "+237600000000",
        password: "S3curePassword!",
      });

      expect(result.accessToken).toBe("signed-jwt-token");
      expect(result.agency.status).toBe(AgencyStatus.PENDING);
      expect(result.user.email).toBe("admin@agence-test.com");
    });

    it("rejette si un compte existe déjà avec cet email", async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          agencyName: "Agence Test",
          adminFirstName: "Jean",
          adminLastName: "Dupont",
          adminEmail: "admin@agence-test.com",
          adminPhone: "+237600000000",
          password: "S3curePassword!",
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe("approve", () => {
    it("passe une agence PENDING à APPROVED", async () => {
      prisma.agency.findUnique.mockResolvedValue(
        buildAgency({ status: AgencyStatus.PENDING }),
      );
      prisma.agency.update.mockResolvedValue(
        buildAgency({ status: AgencyStatus.APPROVED }),
      );

      const result = await service.approve("agency-1");
      expect(result.status).toBe(AgencyStatus.APPROVED);
    });

    it("rejette si l'agence n'est pas au statut PENDING", async () => {
      prisma.agency.findUnique.mockResolvedValue(
        buildAgency({ status: AgencyStatus.SUSPENDED }),
      );

      await expect(service.approve("agency-1")).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
