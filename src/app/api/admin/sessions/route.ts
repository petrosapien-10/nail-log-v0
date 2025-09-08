// app/api/sessions/route.ts
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { status } from 'http-status';
import { UserWithSessions } from '@/types/user';
import { Session } from '@/types/session';
import { Ticket } from '@/types/ticket';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


// ----------------------------------------------------------------------

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: status[status.UNAUTHORIZED] },
      { status: status.UNAUTHORIZED }
    );
  }

  const { searchParams } = new URL(req.url);
  let start: Date;
  let end: Date;

  try {
    const timeZone = searchParams.get('timeZone') || 'UTC';

    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json(
        { message: 'Missing start or end date' },
        { status: status.BAD_REQUEST }
      );
    }

    const startDate = dayjs.tz(startParam, timeZone);
    const endDate = dayjs.tz(endParam, timeZone);

    if (!startDate.isValid() || !endDate.isValid()) {
      return NextResponse.json({ message: 'Invalid date range' }, { status: status.BAD_REQUEST });
    }

    start = startDate.startOf('day').utc().toDate();
    end = endDate.endOf('day').utc().toDate();

  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: status.BAD_REQUEST });
  }

  try {
    const usersSnap = await getDocs(collection(firestore, 'users'));
    const result: UserWithSessions[] = [];

    for (const userDoc of usersSnap.docs) {
      const { name, image, basicSalaryRate } = userDoc.data();

      const sessionsRef = collection(firestore, 'users', userDoc.id, 'sessions');
      const sessionQuery = query(
        sessionsRef,
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end))
      );
      const sessionsSnap = await getDocs(sessionQuery);

      const sessionsWithTickets: (Session & { tickets: Ticket[] })[] = [];

      for (const sessionDoc of sessionsSnap.docs) {
        const ticketsSnap = await getDocs(
          collection(firestore, 'users', userDoc.id, 'sessions', sessionDoc.id, 'tickets')
        );

        const tickets: Ticket[] = ticketsSnap.docs.map((ticketDoc) => ({
          id: ticketDoc.id,
          ...ticketDoc.data(),
        })) as Ticket[];

        sessionsWithTickets.push({
          id: sessionDoc.id,
          ...(sessionDoc.data() as Omit<Session, 'id'>),
          tickets,
        });
      }

      if (sessionsWithTickets.length > 0) {
        result.push({
          id: userDoc.id,
          name,
          image,
          basicSalaryRate,
          sessions: sessionsWithTickets,
        });
      }
    }

    return NextResponse.json({ message: status[status.OK], data: result }, { status: status.OK });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
