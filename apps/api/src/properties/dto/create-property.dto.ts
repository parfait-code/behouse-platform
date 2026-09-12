import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CreatePropertyDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MinLength(20, {
    message: "La description doit contenir au moins 20 caractères.",
  })
  description!: string;

  @IsString()
  propertyType!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsNumber()
  @IsPositive()
  pricePerNight!: number;

  // URLs de photos déjà hébergées (Neon Storage) — la génération d'URLs
  // pré-signées d'upload est un endpoint séparé, à construire (TODO).
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsObject()
  houseRules?: Record<string, boolean>;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  // Surcharge de la politique d'annulation par défaut (cahier des charges,
  // section 6.2.7) — absent = règle unique plateforme appliquée.
  @IsOptional()
  @IsObject()
  cancellationPolicyOverride?: Record<string, unknown>;
}
