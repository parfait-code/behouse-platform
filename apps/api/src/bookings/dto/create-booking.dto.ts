import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
} from "class-validator";

export class CreateBookingDto {
  @IsUUID()
  propertyId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  guests?: number;
}
