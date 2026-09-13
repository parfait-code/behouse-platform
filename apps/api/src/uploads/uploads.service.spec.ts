import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadsService } from "./uploads.service";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest
    .fn()
    .mockResolvedValue("https://signed-upload-url.example.com"),
}));

describe("UploadsService", () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                AWS_ENDPOINT_URL_S3: "https://storage.example.neon.tech",
                S3_BUCKET_NAME: "behouse_storage",
                AWS_ACCESS_KEY_ID: "test-key",
                AWS_SECRET_ACCESS_KEY: "test-secret",
              };
              return values[key];
            }),
            get: jest.fn(() => "eu-central-1"),
          },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it("génère une clé namespacée par agence et par type d'upload", async () => {
    const result = await service.createPresignedUpload("agency-1", {
      fileName: "Ma Photo Salon.JPG",
      contentType: "image/jpeg",
      purpose: "PROPERTY_PHOTO",
    });

    expect(result.key).toMatch(
      /^agencies\/agency-1\/property_photo\/.+-ma-photo-salon\.jpg$/,
    );
  });

  it("construit une URL publique path-style (endpoint/bucket/clé)", async () => {
    const result = await service.createPresignedUpload("agency-1", {
      fileName: "logo.png",
      contentType: "image/png",
      purpose: "AGENCY_LOGO",
    });

    expect(result.publicUrl).toBe(
      `https://storage.example.neon.tech/behouse_storage/${result.key}`,
    );
  });

  it("renvoie une URL de dépôt pré-signée", async () => {
    const result = await service.createPresignedUpload("agency-1", {
      fileName: "logo.png",
      contentType: "image/png",
      purpose: "AGENCY_LOGO",
    });

    expect(result.uploadUrl).toBe("https://signed-upload-url.example.com");
    expect(getSignedUrl).toHaveBeenCalled();
  });
});
