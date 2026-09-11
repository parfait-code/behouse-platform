import { IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegisterPhoneDto {
  // Format international requis (ex: +237600000000) — cohérent avec le
  // sélecteur d'indicatif pays des maquettes de référence (popup "Envoyer
  // une demande").
  @IsPhoneNumber(undefined, {
    message:
      "Le numéro doit être un numéro de téléphone valide (format international).",
  })
  phone!: string;

  @IsString()
  @MinLength(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  })
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}
