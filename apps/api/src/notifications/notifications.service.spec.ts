import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import { NotificationsService } from "./notifications.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let emailService: jest.Mocked<Pick<EmailService, "send">>;

  beforeEach(async () => {
    emailService = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it("notifie une agence approuvée avec le bon destinataire", async () => {
    await service.notifyAgencyApproved("admin@agence.com", "Agence Dupont");

    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@agence.com",
        subject: expect.stringContaining("approuvée"),
      }),
    );
  });

  it("échappe le HTML dans le nom d'agence (protection XSS)", async () => {
    await service.notifyAgencyApproved(
      "admin@agence.com",
      "<script>alert(1)</script>",
    );

    const call = emailService.send.mock.calls[0]?.[0];
    expect(call?.html).not.toContain("<script>");
    expect(call?.html).toContain("&lt;script&gt;");
  });

  it("inclut le motif de rejet quand il est fourni", async () => {
    await service.notifyAgencyRejected(
      "admin@agence.com",
      "Agence Dupont",
      "Documents manquants",
    );

    const call = emailService.send.mock.calls[0]?.[0];
    expect(call?.html).toContain("Documents manquants");
  });

  it("n'envoie rien si le locataire n'a pas d'email (inscrit par téléphone)", async () => {
    await service.notifyBookingConfirmed({
      tenantEmail: null,
      tenantFirstName: "Marie",
      propertyTitle: "Bel appartement",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      totalAmount: "75000",
    });

    expect(emailService.send).not.toHaveBeenCalled();
  });

  it("notifie la confirmation de réservation si le locataire a un email", async () => {
    await service.notifyBookingConfirmed({
      tenantEmail: "marie@example.com",
      tenantFirstName: "Marie",
      propertyTitle: "Bel appartement",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      totalAmount: "75000",
    });

    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "marie@example.com" }),
    );
  });
});
