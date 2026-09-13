import { IsIn, IsString, MinLength } from "class-validator";

export const UPLOAD_PURPOSES = ["PROPERTY_PHOTO", "AGENCY_LOGO"] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

// Limité aux formats image courants — évite qu'un client détourne cet
// endpoint pour héberger des fichiers arbitraires sur le bucket Behouse.
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export class RequestPresignedUploadDto {
  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsIn(ALLOWED_CONTENT_TYPES, {
    message: `contentType doit être l'un de : ${ALLOWED_CONTENT_TYPES.join(", ")}`,
  })
  contentType!: (typeof ALLOWED_CONTENT_TYPES)[number];

  @IsIn(UPLOAD_PURPOSES)
  purpose!: UploadPurpose;
}
