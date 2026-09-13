import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AgencyMemberGuard } from "../agencies/guards/agency-member.guard";
import { CurrentAgencyId } from "../agencies/decorators/current-agency-id.decorator";
import { UploadsService, PresignedUploadResult } from "./uploads.service";
import { RequestPresignedUploadDto } from "./dto/request-presigned-upload.dto";

/**
 * Utilisé pour les photos de biens et le logo d'agence (cahier des
 * charges, 7.3 et 7.6). Réservé aux membres d'une agence — un locataire
 * n'a aucune raison d'uploader vers ce bucket.
 */
@Controller("agency/uploads")
@UseGuards(JwtAuthGuard, RolesGuard, AgencyMemberGuard)
@Roles(UserRole.AGENCY_ADMIN, UserRole.AGENT)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  presign(
    @CurrentAgencyId() agencyId: string,
    @Body() dto: RequestPresignedUploadDto,
  ): Promise<PresignedUploadResult> {
    return this.uploadsService.createPresignedUpload(agencyId, dto);
  }
}
