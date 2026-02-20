import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';

export async function GET(_: Request, context: { params: Promise<{ userId?: string }> }) {
  const { userId } = await context.params;

  try {
    // checker
    if (!userId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const userRef = doc(firestore, 'users', userId);
    const snapshot = await getDoc(userRef);

    // checker
    if (!snapshot.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const user = { id: snapshot.id, ...snapshot.data() };

    return NextResponse.json(
      {
        message: status[status.OK],
        data: user,
      },
      { status: status.OK }
    );
  } catch (error) {
    const message = (error as Error).message;
    let statusCode;

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
