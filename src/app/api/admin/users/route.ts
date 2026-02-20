import { firestore } from '@/lib/firebase';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        image: data.image || '',
        basicSalaryRate: data.basicSalaryRate,
        ticketBonusRate: data.ticketBonusRate,
        dailyBonusMinThreshold: data.dailyBonusMinThreshold,
        isDeleted: data.isDeleted || false,
        dob: data.dob || '',
        address: data.address || '',
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json(
      {
        message: status[status.OK],
        data: users,
      },
      { status: status.OK }
    );
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}

// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(status[status.UNAUTHORIZED]);
    }

    const body = await req.json();

    const {
      name,
      phone,
      image = '',
      basicSalaryRate,
      ticketBonusRate,
      dailyBonusMinThreshold,
      isDeleted = false,
      address = '',
      dob = '',
    } = body;

    const missingImportantData =
      !name || basicSalaryRate == null || ticketBonusRate == null || dailyBonusMinThreshold == null;

    if (missingImportantData) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const usersRef = collection(firestore, 'users');

    const newUser = {
      name,
      phone,
      image,
      basicSalaryRate,
      ticketBonusRate,
      dailyBonusMinThreshold,
      isDeleted,
      address,
      dob,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(usersRef, newUser);

    return NextResponse.json(
      {
        message: status[status.CREATED],
        data: { id: docRef.id, ...newUser },
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
