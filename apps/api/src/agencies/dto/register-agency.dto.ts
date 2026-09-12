import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { BankDetailsDto } from "./bank-details.dto";

export class RegisterAgencyDto {
  @IsString()
  @MinLength(2)
  agencyName!: string;

  @IsString()
  adminFirstName!: string;

  @IsString()
  adminLastName!: string;

  // Email professionnel : sert à la fois de contact agence et d'identifiant
  // de connexion du compte Admin Agence (voir cahier des charges, 7.1).
  @IsEmail()
  adminEmail!: string;

  @IsPhoneNumber(undefined, {
    message:
      "Le numéro doit être un numéro de téléphone valide (format international).",
  })
  adminPhone!: string;

  @IsString()
  @MinLength(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  })
  password!: string;

  // Optionnel à l'inscription : peut être complété plus tard depuis les
  // paramètres agence (E3, section 7.9 du cahier des charges).
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;
}
