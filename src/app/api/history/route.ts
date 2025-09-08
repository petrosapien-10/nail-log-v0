import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';

// ----------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const historyRef = collection(firestore, 'history');
    const startOfDay = Timestamp.fromDate(new Date(targetDate.setHours(0, 0, 0, 0)));
    const endOfDay = Timestamp.fromDate(new Date(targetDate.setHours(23, 59, 59, 999)));

    const filteredQuery = query(
      historyRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );

    const snapshot = await getDocs(filteredQuery);
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ message: status[status.OK], data: logs }, { status: status.OK });
  } catch (error) {
    const isBadRequest = (error as Error).message === status[status.BAD_REQUEST];
    const errorStatus = isBadRequest ? status.BAD_REQUEST : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: (error as Error).message }, { status: errorStatus });
  }
}

// ----------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { actionType, performedBy, description, userId } = await req.json();

    if (!actionType || !description) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const historyRef = collection(firestore, 'history');
    await addDoc(historyRef, {
      actionType,
      performedBy: performedBy ?? null,
      description,
      userId: userId || null,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ message: status[status.CREATED] }, { status: status.CREATED });
  } catch (error) {
    const isBadRequest = (error as Error).message === status[status.BAD_REQUEST];
    const errorStatus = isBadRequest ? status.BAD_REQUEST : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: (error as Error).message }, { status: errorStatus });
  }
}
