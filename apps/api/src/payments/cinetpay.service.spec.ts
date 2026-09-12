import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";
import { CinetPayService } from "./cinetpay.service";
import { CinetPayNotificationPayload } from "./interfaces/cinetpay.interfaces";

const SECRET_KEY = "test-secret-key";

describe("CinetPayService", () => {
  let service: CinetPayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CinetPayService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === "CINETPAY_SECRET_KEY") return SECRET_KEY;
              return "dummy-value";
            }),
            get: jest.fn(() => "XAF"),
          },
        },
      ],
    }).compile();

    service = module.get<CinetPayService>(CinetPayService);
  });

  describe("verifyWebhookSignature", () => {
    const payload: CinetPayNotificationPayload = {
      cpm_site_id: "123456",
      cpm_trans_id: "booking-abc",
      cpm_trans_date: "2026-09-12 10:00:00",
      cpm_amount: "25000",
      cpm_currency: "XAF",
      signature: "sig-token",
      payment_method: "OM",
      cel_phone_num: "+237600000000",
      cpm_phone_prefixe: "237",
      cpm_language: "fr",
      cpm_version: "V4",
      cpm_payment_config: "SINGLE",
      cpm_page_action: "PAYMENT",
      cpm_custom: "",
      cpm_designation: "",
      cpm_error_message: "",
    };

    function computeExpectedToken(p: CinetPayNotificationPayload): string {
      const concatenated = [
        p.cpm_site_id,
        p.cpm_trans_id,
        p.cpm_trans_date,
        p.cpm_amount,
        p.cpm_currency,
        p.signature,
        p.payment_method,
        p.cel_phone_num,
        p.cpm_phone_prefixe,
        p.cpm_language,
        p.cpm_version,
        p.cpm_payment_config,
        p.cpm_page_action,
        p.cpm_custom,
        p.cpm_designation,
        p.cpm_error_message,
      ]
        .map((v) => v ?? "")
        .join("");
      return createHmac("sha256", SECRET_KEY)
        .update(concatenated)
        .digest("hex");
    }

    it("valide une signature correcte", () => {
      const token = computeExpectedToken(payload);
      expect(service.verifyWebhookSignature(payload, token)).toBe(true);
    });

    it("rejette une signature incorrecte", () => {
      expect(service.verifyWebhookSignature(payload, "invalid-token")).toBe(
        false,
      );
    });

    it("rejette si aucun token n'est fourni", () => {
      expect(service.verifyWebhookSignature(payload, undefined)).toBe(false);
    });

    it("rejette si un champ du payload a été altéré", () => {
      const token = computeExpectedToken(payload);
      const tamperedPayload = { ...payload, cpm_amount: "999999" };
      expect(service.verifyWebhookSignature(tamperedPayload, token)).toBe(
        false,
      );
    });
  });

  describe("mapPaymentMethod", () => {
    it("reconnaît Orange Money", () => {
      expect(service.mapPaymentMethod("OM")).toBe("ORANGE_MONEY");
    });

    it("reconnaît MTN Mobile Money", () => {
      expect(service.mapPaymentMethod("MOMO")).toBe("MTN_MOBILE_MONEY");
    });

    it("retombe sur CARD par défaut", () => {
      expect(service.mapPaymentMethod("VISA")).toBe("CARD");
      expect(service.mapPaymentMethod(undefined)).toBe("CARD");
    });
  });
});
