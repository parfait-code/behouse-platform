import { IsOptional, IsString } from "class-validator";

export class RejectAgencyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
