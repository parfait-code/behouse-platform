import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterEmailDto {
  @IsEmail()
  email!: string;

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
