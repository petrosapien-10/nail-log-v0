import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';
import { updateSessionIncome } from '../../../../../../../utils/updateSessionIncome.helper';
import { calculateTicketData } from '../../../../../../../utils/calculateTicketData.helper';

// ----------------------------------------------------------------------

export async function GET(
  _: Request,
  context: { params: Promise<{ userId?: string; sessionId?: string }> }
) {
  const { userId, sessionId } = await context.params;

  try {
    // checker
    if (!userId || !sessionId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ticketsRef = collection(firestore, 'users', userId, 'sessions', sessionId, 'tickets');

    const snapshot = await getDocs(ticketsRef);
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        data: tickets,
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
      { status: errorStatus }
    );
  }
}

// ----------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId?: string; sessionId?: string }> }
) {
  const { userId, sessionId } = await context.params;

  try {
    // checker
    if (!userId || !sessionId) {
      throw new Error(status[status.BAD_REQUEST]);
    }
    const body = await req.json();
    const { payments, isBonus } = body;

    // checker
    if (!Array.isArray(payments)) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ticketData = await calculateTicketData({ userId, payments, isBonus });

    const ticketsRef = collection(firestore, 'users', userId, 'sessions', sessionId, 'tickets');

    const docRef = await addDoc(ticketsRef, ticketData);

    await updateSessionIncome(userId, sessionId);

    return NextResponse.json(
      {
        message: status[status.CREATED],
        data: { id: docRef.id, ...ticketData },
      },
      { status: status.CREATED }
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
      { status: errorStatus }
    );
  }
}
