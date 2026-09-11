import { IsPhoneNumber, IsString } from "class-validator";

export class LoginPhoneDto {
  @IsPhoneNumber(undefined, {
    message:
      "Le numéro doit être un numéro de téléphone valide (format international).",
  })
  phone!: string;

  @IsString()
  password!: string;
}
