import { firestore } from '@/lib/firebase';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import status from 'http-status';

export async function updateSessionTotalSalary(userId: string, sessionId: string) {
  const sessionRef = doc(firestore, 'users', userId, 'sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new Error(status[status.NOT_FOUND]);
  }

  const sessionData = sessionSnap.data();
  const { checkIn, checkOut, basicSalaryRate, date } = sessionData;

  if (!checkIn || !checkOut || basicSalaryRate === undefined || !date) {
    return;
  }

  const sessionDate = dayjs.unix(date.seconds);

  const checkInParts = checkIn.split(':');
  const checkOutParts = checkOut.split(':');

  const checkInTime = sessionDate
    .hour(Number(checkInParts[0]))
    .minute(Number(checkInParts[1]))
    .second(0)
    .millisecond(0);

  const checkOutTime = sessionDate
    .hour(Number(checkOutParts[0]))
    .minute(Number(checkOutParts[1]))
    .second(0)
    .millisecond(0);

  const hours = checkOutTime.diff(checkInTime, 'hour', true);
  const totalSalary = Number((hours * basicSalaryRate).toFixed(2));

  await updateDoc(sessionRef, {
    hours,
    totalSalary,
  });

  return { totalSalary, hours };
}
