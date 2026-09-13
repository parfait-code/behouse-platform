import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, PaymentStatus, Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CinetPayService } from "../payments/cinetpay.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import {
  AdminBookingView,
  AgencyBookingView,
  BookingView,
  CommissionSummary,
  CreateBookingResult,
  toAdminBookingView,
  toAgencyBookingView,
  toBookingView,
} from "./booking.types";
import { ConfigService } from "@nestjs/config";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cinetPayService: CinetPayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crée une réservation (statut PENDING) et initialise le paiement
   * CinetPay. Le montant réel n'est débité qu'une fois le paiement
   * confirmé côté CinetPay (voir confirmFromWebhook).
   */
  async create(
    tenant: User,
    dto: CreateBookingDto,
  ): Promise<CreateBookingResult> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        "La date de départ doit être postérieure à la date d'arrivée.",
      );
    }
    if (startDate < this.startOfToday()) {
      throw new BadRequestException(
        "La date d'arrivée ne peut pas être dans le passé.",
      );
    }

    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      include: { agency: true },
    });
    if (!property || property.status !== "PUBLISHED") {
      throw new NotFoundException("Bien introuvable.");
    }

    const nights = Math.round(
      (endDate.getTime() - startDate.getTime()) / MS_PER_DAY,
    );

    const conflictingDates = await this.prisma.availability.count({
      where: {
        propertyId: property.id,
        isBlocked: true,
        date: { gte: startDate, lt: endDate },
      },
    });
    if (conflictingDates > 0) {
      throw new BadRequestException(
        "Ce bien n'est plus disponible sur les dates sélectionnées.",
      );
    }

    const totalAmount = nights * Number(property.pricePerNight);
    const commissionRate = Number(property.agency.commissionRate);
    const commissionAmount = Math.round(totalAmount * commissionRate);
    const agencyPayoutAmount = totalAmount - commissionAmount;

    const booking = await this.prisma.booking.create({
      data: {
        propertyId: property.id,
        tenantId: tenant.id,
        startDate,
        endDate,
        totalAmount,
        commissionAmount,
        agencyPayoutAmount,
        status: BookingStatus.PENDING,
      },
    });

    // TODO : customer_email/customer_phone_number sont attendus par
    // CinetPay, mais un locataire peut n'avoir renseigné que l'un des
    // deux (3 méthodes d'auth). À valider précisément en sandbox CinetPay
    // — un champ manquant pourrait être refusé selon le moyen de paiement
    // choisi par le client sur la page CinetPay.
    const initResult = await this.cinetPayService.initializePayment({
      transactionId: booking.id,
      amount: totalAmount,
      currency: this.configService.get<string>("DEFAULT_CURRENCY", "XAF"),
      description: `Réservation ${property.title}`,
      customerName: tenant.firstName,
      customerSurname: tenant.lastName,
      customerEmail: tenant.email ?? "",
      customerPhoneNumber: tenant.phone ?? "",
    });

    if (initResult.code !== "201" || !initResult.data) {
      // On ne bloque pas la création de la réservation (déjà en base),
      // mais sans lien de paiement le locataire ne peut pas payer —
      // à surveiller/relancer manuellement depuis le dashboard Behouse
      // une fois construit (E9).
      this.logger.error(
        `Réservation ${booking.id} créée mais paiement CinetPay non initialisé.`,
      );
      return { booking: toBookingView(booking), paymentUrl: null };
    }

    return {
      booking: toBookingView(booking),
      paymentUrl: initResult.data.payment_url,
    };
  }

  async findMineForTenant(tenantId: string): Promise<BookingView[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toBookingView);
  }

  // --- Dashboard agence (cahier des charges, 7.4) ---

  async findForAgency(agencyId: string): Promise<AgencyBookingView[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { property: { agencyId } },
      include: { property: true, tenant: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toAgencyBookingView);
  }

  async findOneForAgency(
    agencyId: string,
    bookingId: string,
  ): Promise<AgencyBookingView> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true, tenant: true },
    });
    if (!booking || booking.property.agencyId !== agencyId) {
      throw new NotFoundException("Réservation introuvable.");
    }
    return toAgencyBookingView(booking);
  }

  /**
   * Annule une réservation confirmée à venir. Le remboursement effectif
   * au locataire (API de remboursement CinetPay) n'est PAS déclenché ici
   * — TODO : CinetPay expose un endpoint de remboursement à intégrer une
   * fois sa documentation validée, pour l'instant le remboursement est
   * géré manuellement par l'agence en dehors de la plateforme.
   */
  async cancelForAgency(
    agencyId: string,
    bookingId: string,
  ): Promise<AgencyBookingView> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true, tenant: true },
    });
    if (!booking || booking.property.agencyId !== agencyId) {
      throw new NotFoundException("Réservation introuvable.");
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Impossible d'annuler une réservation au statut "${booking.status}".`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: { property: true, tenant: true },
    });

    // Libère les dates du calendrier pour ce bien.
    await this.prisma.availability.updateMany({
      where: {
        propertyId: booking.propertyId,
        date: { gte: booking.startDate, lt: booking.endDate },
      },
      data: { isBlocked: false },
    });

    return toAgencyBookingView(updated);
  }

  // --- Dashboard Behouse (cahier des charges, 8.1/8.5) ---

  async findAllForAdmin(): Promise<AdminBookingView[]> {
    const bookings = await this.prisma.booking.findMany({
      include: { property: { include: { agency: true } }, tenant: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toAdminBookingView);
  }

  async getCommissionSummary(): Promise<CommissionSummary> {
    const result = await this.prisma.booking.aggregate({
      where: {
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
          ],
        },
      },
      _sum: { commissionAmount: true, totalAmount: true },
      _count: true,
    });

    return {
      totalCommission: (result._sum.commissionAmount ?? 0).toString(),
      totalRevenue: (result._sum.totalAmount ?? 0).toString(),
      bookingsCount: result._count,
    };
  }

  /**
   * Appelé par le contrôleur après vérification de la signature HMAC
   * (voir CinetPayService.verifyWebhookSignature) et de la transaction
   * auprès de CinetPay (source de vérité, pas seulement le webhook).
   */
  async confirmFromWebhook(
    transactionId: string,
    cinetpayStatus: string,
    amount: string,
    cinetpayPaymentMethod: string | undefined,
  ): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: transactionId },
    });

    if (!booking) {
      this.logger.warn(
        `Webhook CinetPay reçu pour une réservation introuvable : ${transactionId}`,
      );
      return;
    }

    // Idempotence : une notification peut être reçue plusieurs fois
    // (documentation CinetPay) — on ignore si déjà traitée.
    if (booking.status !== BookingStatus.PENDING) {
      this.logger.log(
        `Webhook CinetPay ignoré (réservation ${transactionId} déjà au statut ${booking.status}).`,
      );
      return;
    }

    if (cinetpayStatus === "WAITING_FOR_CUSTOMER") {
      // Statut intermédiaire (certains opérateurs) — on attend la
      // notification finale, rien à faire pour l'instant.
      return;
    }

    const method = this.cinetPayService.mapPaymentMethod(cinetpayPaymentMethod);

    if (cinetpayStatus === "ACCEPTED") {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: Number(amount),
            method,
            status: PaymentStatus.SUCCEEDED,
            cinetpayTransactionId: transactionId,
            paidAt: new Date(),
          },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED },
        });

        await tx.payout.create({
          data: {
            agencyId: (
              await tx.property.findUniqueOrThrow({
                where: { id: booking.propertyId },
                select: { agencyId: true },
              })
            ).agencyId,
            bookingIds: [booking.id],
            amount: booking.agencyPayoutAmount,
          },
        });

        // Bloque les dates réservées sur le calendrier du bien.
        const dates = this.enumerateDates(booking.startDate, booking.endDate);
        await Promise.all(
          dates.map((date) =>
            tx.availability.upsert({
              where: {
                propertyId_date: { propertyId: booking.propertyId, date },
              },
              create: { propertyId: booking.propertyId, date, isBlocked: true },
              update: { isBlocked: true },
            }),
          ),
        );
      });
    } else {
      // REFUSED, CANCELLED, ou tout autre statut non prévu.
      await this.prisma.$transaction([
        this.prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: Number(amount),
            method,
            status: PaymentStatus.FAILED,
            cinetpayTransactionId: transactionId,
          },
        }),
        this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.FAILED },
        }),
      ]);
    }
  }

  private startOfToday(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  private enumerateDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
