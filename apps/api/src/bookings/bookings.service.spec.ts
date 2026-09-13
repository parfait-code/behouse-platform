import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  Agency,
  AgencyStatus,
  AuthMethod,
  Property,
  PropertyStatus,
  User,
  UserRole,
} from "@prisma/client";
import { BookingsService } from "./bookings.service";
import { PrismaService } from "../prisma/prisma.service";
import { CinetPayService } from "../payments/cinetpay.service";

const buildAgency = (overrides: Partial<Agency> = {}): Agency => ({
  id: "agency-1",
  name: "Agence Test",
  description: null,
  logoUrl: null,
  aboutPageContent: null,
  status: AgencyStatus.APPROVED,
  commissionRate: {
    toString: () => "0.1",
    valueOf: () => 0.1,
  } as unknown as Agency["commissionRate"],
  bankDetails: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const buildProperty = (overrides: Partial<Property> = {}): Property => ({
  id: "property-1",
  agencyId: "agency-1",
  title: "Bel appartement",
  description: "Description suffisamment longue pour passer la validation.",
  propertyType: "Appartement",
  address: "12 Rue de la Paix",
  city: "Yaoundé",
  latitude: null,
  longitude: null,
  pricePerNight: {
    toString: () => "25000",
    valueOf: () => 25000,
  } as unknown as Property["pricePerNight"],
  maxGuests: 3,
  bedrooms: 1,
  bathrooms: 1,
  beds: 2,
  status: PropertyStatus.PUBLISHED,
  photos: ["https://example.com/photo.jpg"],
  amenities: [],
  houseRules: null,
  cancellationPolicyOverride: null,
  checkInTime: null,
  checkOutTime: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const buildTenant = (overrides: Partial<User> = {}): User => ({
  id: "tenant-1",
  email: "tenant@example.com",
  phone: "+237600000000",
  passwordHash: "hashed",
  googleId: null,
  authMethod: AuthMethod.EMAIL_PASSWORD,
  role: UserRole.TENANT,
  firstName: "Marie",
  lastName: "Ngo",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("BookingsService", () => {
  let service: BookingsService;
  let prisma: {
    property: { findUnique: jest.Mock };
    availability: { count: jest.Mock; updateMany: jest.Mock };
    booking: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      aggregate: jest.Mock;
    };
  };
  let cinetPayService: jest.Mocked<Pick<CinetPayService, "initializePayment">>;

  beforeEach(async () => {
    prisma = {
      property: { findUnique: jest.fn() },
      availability: {
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      booking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    cinetPayService = {
      initializePayment: jest.fn().mockResolvedValue({
        code: "201",
        message: "CREATED",
        api_response_id: "1",
        data: {
          payment_token: "token",
          payment_url: "https://checkout.cinetpay.com/payment/token",
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CinetPayService, useValue: cinetPayService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => "XAF") },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe("create", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in4Days = new Date();
    in4Days.setDate(in4Days.getDate() + 4);

    it("rejette si la date de départ précède la date d'arrivée", async () => {
      await expect(
        service.create(buildTenant(), {
          propertyId: "property-1",
          startDate: in4Days.toISOString(),
          endDate: tomorrow.toISOString(),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejette si le bien n'est pas publié", async () => {
      prisma.property.findUnique.mockResolvedValue({
        ...buildProperty({ status: PropertyStatus.DRAFT }),
        agency: buildAgency(),
      });

      await expect(
        service.create(buildTenant(), {
          propertyId: "property-1",
          startDate: tomorrow.toISOString(),
          endDate: in4Days.toISOString(),
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejette si des dates du séjour sont bloquées", async () => {
      prisma.property.findUnique.mockResolvedValue({
        ...buildProperty(),
        agency: buildAgency(),
      });
      prisma.availability.count.mockResolvedValue(1);

      await expect(
        service.create(buildTenant(), {
          propertyId: "property-1",
          startDate: tomorrow.toISOString(),
          endDate: in4Days.toISOString(),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("calcule correctement le montant total et la commission (3 nuits x 25000, 10%)", async () => {
      prisma.property.findUnique.mockResolvedValue({
        ...buildProperty(),
        agency: buildAgency(),
      });
      prisma.booking.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => ({
          id: "booking-1",
          ...data,
        }),
      );

      await service.create(buildTenant(), {
        propertyId: "property-1",
        startDate: tomorrow.toISOString(),
        endDate: in4Days.toISOString(),
      });

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 75000,
            commissionAmount: 7500,
            agencyPayoutAmount: 67500,
          }),
        }),
      );
    });

    it("initialise le paiement CinetPay avec le montant et la référence de réservation", async () => {
      prisma.property.findUnique.mockResolvedValue({
        ...buildProperty(),
        agency: buildAgency(),
      });
      prisma.booking.create.mockResolvedValue({
        id: "booking-1",
        propertyId: "property-1",
        startDate: tomorrow,
        endDate: in4Days,
        totalAmount: 75000,
        status: "PENDING",
        createdAt: new Date(),
      });

      const result = await service.create(buildTenant(), {
        propertyId: "property-1",
        startDate: tomorrow.toISOString(),
        endDate: in4Days.toISOString(),
      });

      expect(cinetPayService.initializePayment).toHaveBeenCalledWith(
        expect.objectContaining({ transactionId: "booking-1", amount: 75000 }),
      );
      expect(result.paymentUrl).toBe(
        "https://checkout.cinetpay.com/payment/token",
      );
    });
  });

  describe("cancelForAgency", () => {
    const buildBookingWithRelations = () => ({
      id: "booking-1",
      propertyId: "property-1",
      tenantId: "tenant-1",
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 4 * 86400000),
      totalAmount: 75000,
      commissionAmount: 7500,
      agencyPayoutAmount: 67500,
      status: "CONFIRMED",
      createdAt: new Date(),
      property: buildProperty(),
      tenant: buildTenant(),
    });

    it("renvoie 404 si la réservation appartient à une autre agence", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...buildBookingWithRelations(),
        property: buildProperty({ agencyId: "agency-2" }),
      });

      await expect(
        service.cancelForAgency("agency-1", "booking-1"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejette l'annulation si la réservation n'est pas CONFIRMED", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...buildBookingWithRelations(),
        status: "PENDING",
      });

      await expect(
        service.cancelForAgency("agency-1", "booking-1"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("annule et libère le calendrier si la réservation est CONFIRMED", async () => {
      const booking = buildBookingWithRelations();
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.booking.update.mockResolvedValue({
        ...booking,
        status: "CANCELLED",
      });

      const result = await service.cancelForAgency("agency-1", "booking-1");

      expect(result.status).toBe("CANCELLED");
      expect(prisma.availability.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ propertyId: "property-1" }),
          data: { isBlocked: false },
        }),
      );
    });
  });

  describe("getCommissionSummary", () => {
    it("agrège les commissions des réservations confirmées/terminées", async () => {
      prisma.booking.aggregate.mockResolvedValue({
        _sum: { commissionAmount: 15000, totalAmount: 150000 },
        _count: 6,
      });

      const summary = await service.getCommissionSummary();

      expect(summary).toEqual({
        totalCommission: "15000",
        totalRevenue: "150000",
        bookingsCount: 6,
      });
    });
  });
});
