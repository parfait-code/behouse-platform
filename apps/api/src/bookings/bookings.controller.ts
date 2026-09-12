import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { User, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { BookingsService } from "./bookings.service";
import { CinetPayService } from "../payments/cinetpay.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingView, CreateBookingResult } from "./booking.types";
import { CinetPayNotificationPayload } from "../payments/interfaces/cinetpay.interfaces";

@Controller("bookings")
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly cinetPayService: CinetPayService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  create(
    @CurrentUser() tenant: User,
    @Body() dto: CreateBookingDto,
  ): Promise<CreateBookingResult> {
    return this.bookingsService.create(tenant, dto);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  findMine(@CurrentUser() tenant: User): Promise<BookingView[]> {
    return this.bookingsService.findMineForTenant(tenant.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(
    @CurrentUser() user: User,
    @Param("id") id: string,
  ): Promise<BookingView> {
    const bookings = await this.bookingsService.findMineForTenant(user.id);
    const match = bookings.find((b) => b.id === id);
    if (!match) {
      throw new NotFoundException("Réservation introuvable.");
    }
    return match;
  }

  /**
   * Webhook CinetPay (cahier des charges technique, section 4). Reçu en
   * x-www-form-urlencoded — le body n'est volontairement PAS un DTO
   * class-validator (voir CinetPayNotificationPayload) pour ne pas
   * risquer de rejeter une notification à cause d'un champ imprévu.
   */
  @Post("cinetpay/webhook")
  async handleWebhook(
    @Body() payload: CinetPayNotificationPayload,
    @Headers("x-token") xToken: string | undefined,
  ): Promise<{ received: boolean }> {
    const signatureValid = this.cinetPayService.verifyWebhookSignature(
      payload,
      xToken,
    );

    if (!signatureValid || !payload.cpm_trans_id) {
      // On répond quand même 200 pour éviter que CinetPay ne s'acharne à
      // réessayer une notification frauduleuse ou malformée ; l'événement
      // est simplement ignoré.
      return { received: true };
    }

    // Source de vérité : on revérifie auprès de CinetPay plutôt que de se
    // fier uniquement au contenu du webhook (recommandation officielle).
    const verification = await this.cinetPayService.verifyTransaction(
      payload.cpm_trans_id,
    );

    if (verification.data) {
      await this.bookingsService.confirmFromWebhook(
        payload.cpm_trans_id,
        verification.data.status,
        verification.data.amount,
        verification.data.payment_method,
      );
    }

    return { received: true };
  }

  /**
   * Page de retour navigateur après paiement (cahier des charges,
   * "Return after payment"). N'est qu'un redirect UX — la confirmation
   * réelle vient du webhook, pas de cet appel.
   */
  @Get("cinetpay/return")
  async handleReturn(
    @Query("transaction_id") transactionId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>("FRONTEND_URL");
    if (!transactionId) {
      res.redirect(`${frontendUrl}/`);
      return;
    }
    res.redirect(`${frontendUrl}/bookings/${transactionId}/confirmation`);
  }
}
