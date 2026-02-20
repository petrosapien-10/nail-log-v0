import { firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EXTEND_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const { password } = await req.json();
    if (!password || typeof password !== 'string') {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const updatedAt = Date.now();
    const version = crypto.randomUUID();
    const createdAt = Timestamp.now();
    const expiresAt = updatedAt + SESSION_DURATION_MS;

    const ref = doc(firestore, 'settings', 'dashboardAccess');
    await setDoc(ref, {
      passwordHash,
      updatedAt,
      expiresAt,
      version,
      createdAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password updated successfully.',
        updatedAt,
        version,
      },
      { status: status.OK }
    );
  } catch (error) {
    const msg = (error as Error).message;
    const errorStatus =
      msg === status[status.BAD_REQUEST] || msg === status[status.UNAUTHORIZED]
        ? status.BAD_REQUEST
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: msg }, { status: errorStatus });
  }
}

//-----------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const ref = doc(firestore, 'settings', 'dashboardAccess');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    const newExpiresAt = Date.now() + EXTEND_DURATION_MS;

    await updateDoc(ref, {
      expiresAt: newExpiresAt,
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        newExpiresAt,
      },
      { status: status.OK }
    );
  } catch (error) {
    const msg = (error as Error).message;
    const errorStatus =
      msg === status[status.BAD_REQUEST] || msg === status[status.UNAUTHORIZED]
        ? status.BAD_REQUEST
        : status.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ message: msg }, { status: errorStatus });
  }
}
