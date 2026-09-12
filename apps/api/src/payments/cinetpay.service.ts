import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import {
  CinetPayCheckResponse,
  CinetPayInitResponse,
  CinetPayNotificationPayload,
  InitializePaymentParams,
} from "./interfaces/cinetpay.interfaces";

const CINETPAY_BASE_URL = "https://api-checkout.cinetpay.com/v2";

@Injectable()
export class CinetPayService {
  private readonly logger = new Logger(CinetPayService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialise un paiement CinetPay. `transactionId` doit être unique et ne
   * pas contenir #, /, $, _, & (voir doc "Initialisation d'un paiement").
   * On y met l'id du Booking : c'est un UUID, donc déjà conforme.
   */
  async initializePayment(
    params: InitializePaymentParams,
  ): Promise<CinetPayInitResponse> {
    const body = {
      apikey: this.configService.getOrThrow<string>("CINETPAY_API_KEY"),
      site_id: this.configService.getOrThrow<string>("CINETPAY_SITE_ID"),
      transaction_id: params.transactionId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      customer_name: params.customerName,
      customer_surname: params.customerSurname,
      customer_email: params.customerEmail,
      customer_phone_number: params.customerPhoneNumber,
      notify_url: this.configService.getOrThrow<string>("CINETPAY_NOTIFY_URL"),
      return_url: this.configService.getOrThrow<string>("CINETPAY_RETURN_URL"),
      channels: "ALL",
      lang: "FR",
    };

    const response = await fetch(`${CINETPAY_BASE_URL}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as CinetPayInitResponse;

    if (data.code !== "201") {
      this.logger.error(
        `Échec initialisation CinetPay (transaction ${params.transactionId}) : ${data.code} - ${data.message}`,
      );
    }

    return data;
  }

  /**
   * Vérifie le statut réel d'une transaction auprès de CinetPay — à
   * toujours appeler après réception d'une notification webhook, la
   * documentation CinetPay le recommande explicitement (le webhook seul
   * n'est pas considéré comme suffisant).
   */
  async verifyTransaction(
    transactionId: string,
  ): Promise<CinetPayCheckResponse> {
    const body = {
      apikey: this.configService.getOrThrow<string>("CINETPAY_API_KEY"),
      site_id: this.configService.getOrThrow<string>("CINETPAY_SITE_ID"),
      transaction_id: transactionId,
    };

    const response = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return response.json() as Promise<CinetPayCheckResponse>;
  }

  /**
   * Vérifie la signature HMAC de l'entête `x-token` d'une notification
   * webhook (voir doc "CinetPay X-TOKEN HMAC"). L'ordre de concaténation
   * des champs est imposé par CinetPay — ne pas le modifier.
   */
  verifyWebhookSignature(
    payload: CinetPayNotificationPayload,
    xTokenHeader: string | undefined,
  ): boolean {
    if (!xTokenHeader) return false;

    const secretKey = this.configService.getOrThrow<string>(
      "CINETPAY_SECRET_KEY",
    );

    const concatenated = [
      payload.cpm_site_id,
      payload.cpm_trans_id,
      payload.cpm_trans_date,
      payload.cpm_amount,
      payload.cpm_currency,
      payload.signature,
      payload.payment_method,
      payload.cel_phone_num,
      payload.cpm_phone_prefixe,
      payload.cpm_language,
      payload.cpm_version,
      payload.cpm_payment_config,
      payload.cpm_page_action,
      payload.cpm_custom,
      payload.cpm_designation,
      payload.cpm_error_message,
    ]
      .map((value) => value ?? "")
      .join("");

    const expectedToken = createHmac("sha256", secretKey)
      .update(concatenated)
      .digest("hex");

    // Comparaison à temps constant pour éviter les attaques par timing.
    const expectedBuffer = Buffer.from(expectedToken, "utf8");
    const receivedBuffer = Buffer.from(xTokenHeader, "utf8");
    if (expectedBuffer.length !== receivedBuffer.length) return false;

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  }

  /**
   * Convertit le code opérateur CinetPay en PaymentMethod interne.
   * TODO : les codes exacts renvoyés par CinetPay (ex: "OM", "MOMO"...)
   * sont à confirmer précisément en sandbox — mapping conservateur en
   * attendant, avec CARD en repli.
   */
  mapPaymentMethod(
    cinetpayMethod: string | undefined,
  ): "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" {
    const method = (cinetpayMethod ?? "").toUpperCase();
    // Ordre important : "MOMO" contient la sous-chaine "OM", donc le test
    // MTN/MOMO doit etre evalue AVANT celui d'Orange Money, sous peine de
    // mal classer les paiements MTN (bug detecte par les tests unitaires).
    if (method.includes("MTN") || method.includes("MOMO"))
      return "MTN_MOBILE_MONEY";
    if (method.includes("OM") || method.includes("ORANGE"))
      return "ORANGE_MONEY";
    return "CARD";
  }
}
