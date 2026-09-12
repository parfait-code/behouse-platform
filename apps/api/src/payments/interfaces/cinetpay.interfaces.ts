/**
 * Types basés sur la documentation officielle CinetPay :
 * https://docs.cinetpay.com/api/1.0-fr/checkout/initialisation
 * https://docs.cinetpay.com/api/1.0-fr/checkout/notification
 * https://docs.cinetpay.com/api/1.0-fr/checkout/hmac
 */

export interface InitializePaymentParams {
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhoneNumber: string;
}

export interface CinetPayInitResponse {
  code: string; // "201" = créé avec succès
  message: string;
  description?: string;
  data?: {
    payment_token: string;
    payment_url: string;
  };
  api_response_id: string;
}

export interface CinetPayCheckResponse {
  code: string; // "00" = succès de l'appel (vérifier ensuite data.status)
  message: string;
  data?: {
    amount: string;
    currency: string;
    status:
      "ACCEPTED" | "REFUSED" | "CANCELLED" | "WAITING_FOR_CUSTOMER" | string;
    payment_method: string;
    description: string;
    metadata: string | null;
    operator_id: string;
    payment_date: string;
    fund_availability_date: string;
  };
  api_response_id: string;
}

/**
 * Corps de la requête envoyée par CinetPay sur notify_url — reçu en
 * x-www-form-urlencoded, donc tous les champs arrivent en chaînes.
 * Interface volontairement PAS une classe class-validator : le
 * ValidationPipe global (whitelist + forbidNonWhitelisted) rejetterait la
 * requête si CinetPay envoie un champ non prévu ici. On type juste pour
 * la lisibilité et on lit les champs défensivement dans le contrôleur.
 */
export interface CinetPayNotificationPayload {
  cpm_site_id?: string;
  cpm_trans_id?: string;
  cpm_trans_date?: string;
  cpm_amount?: string;
  cpm_currency?: string;
  signature?: string;
  payment_method?: string;
  cel_phone_num?: string;
  cpm_phone_prefixe?: string;
  cpm_language?: string;
  cpm_version?: string;
  cpm_payment_config?: string;
  cpm_page_action?: string;
  cpm_custom?: string;
  cpm_designation?: string;
  cpm_error_message?: string;
}
