import { firestore } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';

// ----------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId?: string; sessionId?: string }> }
) {
  try {
    const { userId, sessionId } = await context.params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    if (!userId || !sessionId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const sessionRef = doc(firestore, 'users', userId, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    await deleteDoc(sessionRef);

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
      case status[status.UNAUTHORIZED]:
        statusCode = status.UNAUTHORIZED;
        break;
      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }
}
