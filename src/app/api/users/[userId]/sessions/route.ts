import { firestore } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { serverTimestamp } from 'firebase/firestore';

dayjs.extend(utc);
dayjs.extend(timezone);

// ----------------------------------------------------------------------

export async function GET(_: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;

  try {
    //checker
    if (!userId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const sessionsRef = collection(firestore, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsRef);

    const sessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        message: status[status.OK],
        data: sessions,
      },
      { status: status.OK }
    );
  } catch (error) {
    const errorStatus =
      (error as Error).message === status[status.BAD_REQUEST]
        ? status.BAD_REQUEST
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

// ----------------------------------------------------------------------

export async function POST(req: Request, context: { params: Promise<{ userId?: string }> }) {
  const { userId } = await context.params;

  try {
    if (!userId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const { date, timeZone } = await req.json();

    if (!date || !timeZone || !dayjs(date).isValid()) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const startOfDay = dayjs.tz(`${date} 00:00`, 'YYYY-MM-DD HH:mm', timeZone).utc().toDate();
    const endOfDay = dayjs.tz(`${date} 23:59`, 'YYYY-MM-DD HH:mm', timeZone).utc().toDate();

    const sessionDate = startOfDay;

    const sessionsRef = collection(firestore, 'users', userId, 'sessions');

    const existingQuery = query(
      sessionsRef,
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error(status[status.CONFLICT]);
    }

    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();
    const dailyBonusMinThreshold = userData.dailyBonusMinThreshold ?? 0;
    const basicSalaryRate = userData.basicSalaryRate ?? 0;

    const checkIn = dayjs().tz(timeZone).format('HH:mm');

    const newSession = {
      date: sessionDate,
      checkIn,
      checkOut: '',
      createdAt: serverTimestamp(),
      basicIncome: 0,
      dailyBonusIncome: 0,
      ticketBonusIncome: 0,
      totalIncome: 0,
      dailyBonusMinThreshold: dailyBonusMinThreshold,
      basicSalaryRate: basicSalaryRate,
      hours: 0,
    };

    const docRef = await addDoc(sessionsRef, newSession);

    return NextResponse.json(
      {
        message: status[status.CREATED],
        data: {
          id: docRef.id,
          ...newSession,
        },
      },
      { status: status.CREATED }
    );
  } catch (error) {
    const message = (error as Error).message;
    let statusCode: number;

    switch (message) {
      case status[status.BAD_REQUEST]:
        statusCode = status.BAD_REQUEST;
        break;
      case status[status.CONFLICT]:
        statusCode = status.CONFLICT;
        break;
      case 'User not found':
        statusCode = status.NOT_FOUND;
        break;
      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }
}
