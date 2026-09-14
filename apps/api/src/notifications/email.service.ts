import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Wrapper minimal autour de l'API Resend (https://resend.com/docs/api-reference/emails/send-email).
 *
 * Contrairement à CinetPayService/UploadsService, ce service NE fait PAS
 * planter l'application si RESEND_API_KEY est absente : l'envoi d'email
 * est une amélioration de l'expérience, pas un pré-requis bloquant pour
 * qu'une agence soit approuvée ou qu'une réservation soit confirmée.
 * On logue et on ignore silencieusement plutôt que de faire échouer
 * l'action métier sous-jacente.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(input: SendEmailInput): Promise<void> {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    const from = this.configService.get<string>(
      "EMAIL_FROM",
      "Behouse <onboarding@resend.dev>",
    );

    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY non configurée — email à ${input.to} ("${input.subject}") non envoyé.`,
      );
      return;
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        this.logger.error(
          `Échec envoi email à ${input.to} (${response.status}) : ${body}`,
        );
      }
    } catch (error) {
      // Un email qui échoue ne doit jamais faire échouer l'action métier
      // qui le déclenche (approbation agence, confirmation réservation…).
      this.logger.error(
        `Erreur réseau lors de l'envoi d'email à ${input.to}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
