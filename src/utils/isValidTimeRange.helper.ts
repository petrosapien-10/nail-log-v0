import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

export function isValidTimeRange(checkIn: string, checkOut: string, date: Timestamp): boolean {
  const sessionDate = dayjs.unix(date.seconds);

  const checkInParts = checkIn.split(':');
  const checkOutParts = checkOut.split(':');

  const checkInTime = sessionDate.hour(Number(checkInParts[0])).minute(Number(checkInParts[1]));

  const checkOutTime = sessionDate.hour(Number(checkOutParts[0])).minute(Number(checkOutParts[1]));

  const hoursDiff = checkOutTime.diff(checkInTime, 'hour', true);

  return hoursDiff >= 0;
}
