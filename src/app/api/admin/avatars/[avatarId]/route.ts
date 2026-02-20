import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ avatarId: string }> }
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: status[status.UNAUTHORIZED] },
      { status: status.UNAUTHORIZED }
    );
  }

  try {
    const { avatarId } = await params;
    const { isTaken } = await req.json();

    if (typeof isTaken !== 'boolean') {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const avatarRef = doc(firestore, 'avatars', avatarId);
    await updateDoc(avatarRef, { isTaken });

    return NextResponse.json(
      {
        message: status[status.OK],
        data: { avatarId, isTaken },
      },
      { status: status.OK }
    );
  } catch (error) {
    const err = error as Error;

    const errorStatus =
      err.message === status[status.BAD_REQUEST] || err.message === status[status.UNAUTHORIZED]
        ? err.message === status[status.BAD_REQUEST]
          ? status.BAD_REQUEST
          : status.UNAUTHORIZED
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: err.message }, { status: errorStatus });
  }
}
