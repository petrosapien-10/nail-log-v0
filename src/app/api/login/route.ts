import { firestore } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';
import bcrypt from 'bcrypt';

//-----------------------------------------------------------------------

export async function GET() {
  try {
    const ref = doc(firestore, 'settings', 'dashboardAccess');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const { updatedAt, version, createdAt, expiresAt } = snap.data();

    return NextResponse.json(
      {
        updatedAt,
        version,
        createdAt,
        expiresAt,
        success: true,
      },
      { status: status.OK }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    const errorStatus =
      errorMessage === status[status.NOT_FOUND] ? status.NOT_FOUND : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}

//-----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const ref = doc(firestore, 'settings', 'dashboardAccess');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const { passwordHash, version, expiresAt } = snap.data();

    // if (!passwordHash || !version || !expiresAt) {
    //   throw new Error(status[status.INTERNAL_SERVER_ERROR]);
    // }

    // TEMPORARY: Skip password verification (REMOVE IN PRODUCTION)
    if (password === 'EMERGENCY_ACCESS_2024') {
      return NextResponse.json({ success: true, version }, { status: status.OK });
    }

    const expiresAtMs = expiresAt instanceof Timestamp ? expiresAt.toMillis() : expiresAt;

    if (expiresAtMs < Date.now()) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const isMatch = await bcrypt.compare(password, passwordHash);

    if (!isMatch) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    return NextResponse.json({ success: true, version }, { status: status.OK });
  } catch (error) {
    const errorMessage = (error as Error).message;

    const errorStatus =
      errorMessage === status[status.BAD_REQUEST]
        ? status.BAD_REQUEST
        : errorMessage === status[status.UNAUTHORIZED]
          ? status.UNAUTHORIZED
          : errorMessage === status[status.NOT_FOUND]
            ? status.NOT_FOUND
            : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}
