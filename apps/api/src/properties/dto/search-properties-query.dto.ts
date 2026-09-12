import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class SearchPropertiesQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  // Cahier des charges, section 6.1 : seuls les biens disponibles sur toute
  // la période recherchée apparaissent. checkIn/checkOut doivent être
  // fournis ensemble pour que le filtre de disponibilité s'applique.
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  guests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  // Query string attendue : ?amenities=Wifi,Parking,Ascenseur
  // TODO : remplacer ces libellés ad-hoc par le catalogue d'équipements
  // pré-catégorisé prévu au cahier des charges (section 6.2.5) une fois
  // construit, pour garantir la cohérence saisie agence <-> filtre.
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.split(",").map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}
