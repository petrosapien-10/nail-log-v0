import { doc, getDocs, getDoc, updateDoc, collection } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import status from 'http-status';
import { NextResponse } from 'next/server';

const BASE_BONUS = 10;

function calculateDailyBonus(basicIncome: number, threshold: number): number {
  if (basicIncome < threshold) return 0;
  const extra = Math.floor((basicIncome - threshold) / 50) * 5;
  return BASE_BONUS + extra;
}

export async function updateSessionIncome(userId: string, sessionId: string) {
  try {
    const ticketsRef = collection(firestore, 'users', userId, 'sessions', sessionId, 'tickets');
    const snapshot = await getDocs(ticketsRef);

    let basicIncome = 0;
    let ticketBonusIncome = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isBonus) {
        ticketBonusIncome += data.bonusAmount || 0;
      } else {
        basicIncome += data.totalAmount || 0;
      }
    });

    const sessionRef = doc(firestore, 'users', userId, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const sessionData = sessionSnap.data();
    const threshold = sessionData.dailyBonusMinThreshold;

    const dailyBonusIncome = calculateDailyBonus(basicIncome, threshold);

    const totalIncome = basicIncome + ticketBonusIncome + dailyBonusIncome;

    await updateDoc(sessionRef, {
      basicIncome,
      ticketBonusIncome,
      dailyBonusIncome,
      totalIncome,
    });
  } catch (error) {
    const errorStatus =
      (error as Error).message === status[status.NOT_FOUND]
        ? status.NOT_FOUND
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json(
      {
        message: (error as Error).message,
      },
      {
        status: errorStatus,
      }
    );
  }
}
