import { Injectable } from "@nestjs/common";
import { EmailService } from "./email.service";

interface BookingEmailData {
  tenantEmail: string | null;
  tenantFirstName: string;
  propertyTitle: string;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
}

/**
 * Cahier des charges, règles de gestion transverses : "Email/SMS
 * obligatoire à chaque changement de statut clé (réservation
 * confirmée/annulée, agence approuvée/rejetée, bien dépublié)." Seul
 * l'email est couvert au MVP (le SMS est prévu en V1).
 *
 * Un tenant sans email (inscrit uniquement par téléphone) ne reçoit
 * simplement pas ces notifications pour l'instant — le SMS comblera ce
 * trou en V1.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly emailService: EmailService) {}

  async notifyAgencyApproved(
    adminEmail: string,
    agencyName: string,
  ): Promise<void> {
    await this.emailService.send({
      to: adminEmail,
      subject: "Votre agence a été approuvée sur Behouse",
      html: `
        <p>Bonjour,</p>
        <p>Bonne nouvelle : <strong>${escapeHtml(agencyName)}</strong> a été approuvée par l'équipe Behouse.</p>
        <p>Vous pouvez désormais publier vos biens meublés, ils seront visibles publiquement sur la plateforme.</p>
        <p>L'équipe Behouse</p>
      `,
    });
  }

  async notifyAgencyRejected(
    adminEmail: string,
    agencyName: string,
    reason?: string,
  ): Promise<void> {
    await this.emailService.send({
      to: adminEmail,
      subject: "Votre inscription agence sur Behouse",
      html: `
        <p>Bonjour,</p>
        <p>Nous ne sommes malheureusement pas en mesure d'approuver l'inscription de <strong>${escapeHtml(agencyName)}</strong> pour le moment.</p>
        ${reason ? `<p>Motif : ${escapeHtml(reason)}</p>` : ""}
        <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
        <p>L'équipe Behouse</p>
      `,
    });
  }

  async notifyBookingConfirmed(data: BookingEmailData): Promise<void> {
    if (!data.tenantEmail) return;
    await this.emailService.send({
      to: data.tenantEmail,
      subject: "Votre réservation est confirmée",
      html: `
        <p>Bonjour ${escapeHtml(data.tenantFirstName)},</p>
        <p>Votre réservation pour <strong>${escapeHtml(data.propertyTitle)}</strong> est confirmée.</p>
        <p>Du ${formatDate(data.startDate)} au ${formatDate(data.endDate)} — ${escapeHtml(data.totalAmount)} XAF.</p>
        <p>Bon séjour !</p>
        <p>L'équipe Behouse</p>
      `,
    });
  }

  async notifyBookingCancelled(data: BookingEmailData): Promise<void> {
    if (!data.tenantEmail) return;
    await this.emailService.send({
      to: data.tenantEmail,
      subject: "Votre réservation a été annulée",
      html: `
        <p>Bonjour ${escapeHtml(data.tenantFirstName)},</p>
        <p>Votre réservation pour <strong>${escapeHtml(data.propertyTitle)}</strong> (${formatDate(data.startDate)} - ${formatDate(data.endDate)}) a été annulée par l'agence.</p>
        <p>Contactez le support Behouse si vous avez des questions concernant un éventuel remboursement.</p>
        <p>L'équipe Behouse</p>
      `,
    });
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Évite l'injection HTML depuis des champs saisis par l'utilisateur
// (nom d'agence, motif de rejet...) avant de les insérer dans l'email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
