import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Property, PropertyStatus } from "@prisma/client";
import { PropertiesService } from "./properties.service";
import { PrismaService } from "../prisma/prisma.service";

const buildProperty = (overrides: Partial<Property> = {}): Property => ({
  id: "property-1",
  agencyId: "agency-1",
  title: "Bel appartement meublé",
  description: "Un appartement lumineux au centre-ville, entièrement équipé.",
  propertyType: "Appartement",
  address: "12 Rue de la Paix",
  city: "Yaoundé",
  latitude: null,
  longitude: null,
  pricePerNight: {
    toString: () => "25000",
  } as unknown as Property["pricePerNight"],
  status: PropertyStatus.DRAFT,
  photos: [],
  amenities: [],
  houseRules: null,
  cancellationPolicyOverride: null,
  checkInTime: null,
  checkOutTime: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("PropertiesService", () => {
  let service: PropertiesService;
  let prisma: {
    property: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      property: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe("publish", () => {
    it("rejette la publication si le bien n'a aucune photo", async () => {
      prisma.property.findUnique.mockResolvedValue(
        buildProperty({ photos: [] }),
      );

      await expect(
        service.publish("agency-1", "property-1"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("publie le bien si au moins une photo est présente", async () => {
      prisma.property.findUnique.mockResolvedValue(
        buildProperty({ photos: ["https://example.com/photo.jpg"] }),
      );
      prisma.property.update.mockResolvedValue(
        buildProperty({ status: PropertyStatus.PUBLISHED }),
      );

      const result = await service.publish("agency-1", "property-1");
      expect(result.status).toBe(PropertyStatus.PUBLISHED);
    });
  });

  describe("scoping multi-tenant", () => {
    it("renvoie 404 (pas 403) si le bien appartient à une autre agence", async () => {
      prisma.property.findUnique.mockResolvedValue(
        buildProperty({ agencyId: "agency-2" }),
      );

      await expect(
        service.findOneForAgency("agency-1", "property-1"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("renvoie le bien si l'agence correspond", async () => {
      prisma.property.findUnique.mockResolvedValue(
        buildProperty({ agencyId: "agency-1" }),
      );

      const result = await service.findOneForAgency("agency-1", "property-1");
      expect(result.id).toBe("property-1");
    });
  });
});
