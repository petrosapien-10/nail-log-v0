import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';
import { UserUpdatePayload } from '@/types/user';

// ----------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const { userId } = await params;
    if (!userId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { isDeleted: true });

    return NextResponse.json(
      { message: status[status.OK], data: { userId } },
      { status: status.OK }
    );
  } catch (error) {
    const errorStatus =
      (error as Error).message === status[status.BAD_REQUEST] ||
      (error as Error).message === status[status.UNAUTHORIZED]
        ? (error as Error).message === status[status.BAD_REQUEST]
          ? status.BAD_REQUEST
          : status.UNAUTHORIZED
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: (error as Error).message }, { status: errorStatus });
  }
}

// ----------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: status[status.UNAUTHORIZED] },
        { status: status.UNAUTHORIZED }
      );
    }

    const { userId } = await params;
    if (!userId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const body = await req.json();
    const updateData: UserUpdatePayload = {};

    (Object.keys(body) as (keyof UserUpdatePayload)[]).forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, updateData);

    return NextResponse.json(
      { message: status[status.OK], data: { userId, updatedFields: updateData } },
      { status: status.OK }
    );
  } catch (error) {
    const errorStatus =
      (error as Error).message === status[status.BAD_REQUEST] ||
      (error as Error).message === status[status.UNAUTHORIZED]
        ? (error as Error).message === status[status.BAD_REQUEST]
          ? status.BAD_REQUEST
          : status.UNAUTHORIZED
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: (error as Error).message }, { status: errorStatus });
  }
}
