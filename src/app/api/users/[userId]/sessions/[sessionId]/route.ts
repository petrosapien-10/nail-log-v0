import { firestore } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';
import { updateSessionTotalSalary } from '@/utils/updateSessionTotalSalary.helper';
import { isValidTimeRange } from '@/utils/isValidTimeRange.helper';

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

    const sessionRef = doc(firestore, 'users', userId, 'sessions', sessionId);
    const snapshot = await getDoc(sessionRef);

    // checker
    if (!snapshot.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const session = { id: snapshot.id, ...snapshot.data() };

    return NextResponse.json(
      {
        message: status[status.OK],
        data: session,
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId?: string; sessionId?: string }> }
) {
  const { userId, sessionId } = await context.params;

  try {
    if (!userId || !sessionId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const body = await req.json();
    const updates: { checkOut?: string; checkIn?: string } = {};

    if (body.checkOut) updates.checkOut = body.checkOut;
    if (body.checkIn) updates.checkIn = body.checkIn;

    if (Object.keys(updates).length === 0) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const sessionRef = doc(firestore, 'users', userId, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const existingData = sessionSnap.data();
    const checkIn = updates.checkIn ?? existingData.checkIn;
    const checkOut = updates.checkOut ?? existingData.checkOut;

    if (checkIn && checkOut) {
      const date = existingData.date;

      if (!isValidTimeRange(checkIn, checkOut, date)) {
        return NextResponse.json({ message: 'INVALID_TIME_RANGE' }, { status: 400 });
      }
    }

    await updateDoc(sessionRef, updates);
    await updateSessionTotalSalary(userId, sessionId);

    return NextResponse.json({ message: status[status.OK] }, { status: status.OK });
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
      case 'INVALID_TIME_RANGE':
        statusCode = status.BAD_REQUEST;
        break;
      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }
}
