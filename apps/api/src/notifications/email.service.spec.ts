import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";

describe("EmailService", () => {
  let service: EmailService;
  let configValues: Record<string, string | undefined>;

  beforeEach(async () => {
    configValues = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              (key: string, fallback?: string) => configValues[key] ?? fallback,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("n'envoie rien (et ne lève pas d'erreur) si RESEND_API_KEY est absente", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    await expect(
      service.send({ to: "a@b.com", subject: "Test", html: "<p>Test</p>" }),
    ).resolves.toBeUndefined();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("appelle bien l'API Resend si la clé est configurée", async () => {
    configValues.RESEND_API_KEY = "test-key";
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true } as Response);

    await service.send({ to: "a@b.com", subject: "Test", html: "<p>Test</p>" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
  });

  it("n'échoue pas si l'API Resend renvoie une erreur", async () => {
    configValues.RESEND_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      text: () => Promise.resolve("Invalid recipient"),
    } as Response);

    await expect(
      service.send({ to: "invalid", subject: "Test", html: "<p>Test</p>" }),
    ).resolves.toBeUndefined();
  });

  it("n'échoue pas si fetch lève une exception réseau", async () => {
    configValues.RESEND_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    await expect(
      service.send({ to: "a@b.com", subject: "Test", html: "<p>Test</p>" }),
    ).resolves.toBeUndefined();
  });
});
