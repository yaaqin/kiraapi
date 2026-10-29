import { IsEnum } from 'class-validator';
import { BookingStatus } from '../../generated/prisma/client.js';

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
