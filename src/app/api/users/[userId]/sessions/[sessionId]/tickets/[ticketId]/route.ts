import { firestore } from '@/lib/firebase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';
import { calculateTicketData } from '../../../../../../../../utils/calculateTicketData.helper';
import { updateSessionIncome } from '../../../../../../../../utils/updateSessionIncome.helper';

export async function GET(
  _: Request,
  context: {
    params: Promise<{
      userId?: string;
      sessionId?: string;
      ticketId?: string;
    }>;
  }
) {
  const { userId, sessionId, ticketId } = await context.params;

  try {
    // checker
    if (!userId || !sessionId || !ticketId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ticketRef = doc(firestore, 'users', userId, 'sessions', sessionId, 'tickets', ticketId);

    const snapshot = await getDoc(ticketRef);

    // checker
    if (!snapshot.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const ticket = { id: snapshot.id, ...snapshot.data() };

    return NextResponse.json(
      {
        message: status[status.OK],
        data: ticket,
      },
      { status: status.OK }
    );
  } catch (error) {
    const message = (error as Error).message;
    let statusCode: number;

    switch (message) {
      case status[status.BAD_REQUEST]:
        statusCode = status.BAD_REQUEST;
        break;

      case status[status.NOT_FOUND]:
        statusCode = status.NOT_FOUND;
        break;

      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json(
      {
        message,
      },
      { status: statusCode }
    );
  }
}

// ----------------------------------------------------------------------

export async function DELETE(
  _: NextRequest,
  context: {
    params: Promise<{ userId?: string; sessionId?: string; ticketId?: string }>;
  }
) {
  const { userId, sessionId, ticketId } = await context.params;

  try {
    // checker
    if (!userId || !sessionId || !ticketId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ticketRef = doc(firestore, 'users', userId, 'sessions', sessionId, 'tickets', ticketId);

    await deleteDoc(ticketRef);

    await updateSessionIncome(userId, sessionId);

    return NextResponse.json(
      {
        message: status[status.OK],
        data: { id: ticketId },
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId?: string; sessionId?: string; ticketId?: string }> }
) {
  const { userId, sessionId, ticketId } = await context.params;

  try {
    // checker
    if (!userId || !sessionId || !ticketId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const body = await req.json();
    const { payments, isBonus } = body;

    // checker
    if (!Array.isArray(payments)) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ticketData = await calculateTicketData({ userId, payments, isBonus });

    const ticketRef = doc(firestore, 'users', userId, 'sessions', sessionId, 'tickets', ticketId);

    await updateDoc(ticketRef, ticketData);

    await updateSessionIncome(userId, sessionId);

    return NextResponse.json(
      {
        message: status[status.OK],
        data: { id: ticketId },
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
