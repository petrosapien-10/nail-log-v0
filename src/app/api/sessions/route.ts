import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import status from 'http-status';
import { UserWithSession } from '@/types/user';
import { Ticket } from '@/types/ticket';
import { User } from '@/types/user';
import { Session } from '@/types/session';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const timeZone = searchParams.get('timeZone');

  if (!dateParam || !timeZone || !dayjs(dateParam).isValid()) {
    return NextResponse.json(
      { message: status[status.BAD_REQUEST] },
      { status: status.BAD_REQUEST }
    );
  }

  const startOfDay = dayjs.tz(dateParam, timeZone).startOf('day').utc().toDate();
  const endOfDay = dayjs.tz(dateParam, timeZone).endOf('day').utc().toDate();

  try {
    const usersRef = collection(firestore, 'users');
    const usersSnap = await getDocs(usersRef);

    const result: UserWithSession[] = [];

    for (const userDoc of usersSnap.docs) {
      const userData: User = {
        id: userDoc.id,
        ...(userDoc.data() as Omit<User, 'id'>),
      };

      const sessionsRef = collection(firestore, 'users', userDoc.id, 'sessions');
      const sessionQuery = query(
        sessionsRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const sessionsSnap = await getDocs(sessionQuery);

      for (const sessionDoc of sessionsSnap.docs) {
        const ticketsRef = collection(
          firestore,
          'users',
          userDoc.id,
          'sessions',
          sessionDoc.id,
          'tickets'
        );
        const ticketsSnap = await getDocs(ticketsRef);
        const tickets: Ticket[] = ticketsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Ticket[];

        const sessionData: Session & { tickets: Ticket[] } = {
          id: sessionDoc.id,
          ...(sessionDoc.data() as Omit<Session, 'id'>),
          tickets,
        };

        result.push({
          ...userData,
          session: sessionData,
        });
      }
    }

    return NextResponse.json(
      {
        message: status[status.OK],
        data: result,
      },
      { status: status.OK }
    );
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
