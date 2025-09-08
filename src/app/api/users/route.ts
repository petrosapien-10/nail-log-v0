import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';

// ----------------------------------------------------------------------

export async function GET() {
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dob, address, basicSalaryRate, ...allowedFields } = data;

      return {
        id: doc.id,
        ...allowedFields,
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
