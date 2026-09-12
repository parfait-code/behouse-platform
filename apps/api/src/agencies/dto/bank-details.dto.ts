import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export const PAYOUT_METHODS = [
  "BANK",
  "MTN_MOBILE_MONEY",
  "ORANGE_MONEY",
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export class BankDetailsDto {
  @IsIn(PAYOUT_METHODS, {
    message: `payoutMethod doit être l'une des valeurs : ${PAYOUT_METHODS.join(", ")}`,
  })
  payoutMethod!: PayoutMethod;

  @IsString()
  @MinLength(2)
  accountHolderName!: string;

  @IsString()
  @MinLength(4)
  accountNumber!: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}
