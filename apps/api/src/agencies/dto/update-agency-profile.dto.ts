import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class UpdateAgencyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  // Contenu long de la page "à propos" publique (cahier des charges, 6.3).
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  aboutPageContent?: string;
}
