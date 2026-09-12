import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";

export class CreateContactRequestDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber(undefined, {
    message:
      "Le numéro doit être un numéro de téléphone valide (format international).",
  })
  phone!: string;

  @IsOptional()
  @IsDateString()
  requestedStartDate?: string;

  @IsOptional()
  @IsDateString()
  requestedEndDate?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
