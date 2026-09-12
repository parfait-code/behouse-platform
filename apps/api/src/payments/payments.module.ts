import { Module } from "@nestjs/common";
import { CinetPayService } from "./cinetpay.service";

@Module({
  providers: [CinetPayService],
  exports: [CinetPayService],
})
export class PaymentsModule {}
