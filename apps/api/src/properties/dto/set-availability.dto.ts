import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
} from "class-validator";

export class SetAvailabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  dates!: string[];

  @IsBoolean()
  isBlocked!: boolean;
}
