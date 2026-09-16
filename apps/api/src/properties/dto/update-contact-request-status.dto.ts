import { IsIn } from "class-validator";

const CONTACT_REQUEST_STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const;

export class UpdateContactRequestStatusDto {
  @IsIn(CONTACT_REQUEST_STATUSES)
  status!: (typeof CONTACT_REQUEST_STATUSES)[number];
}
