import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import status from 'http-status';

// ----------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: status[status.UNAUTHORIZED] },
      { status: status.UNAUTHORIZED }
    );
  }
  try {
    const avatarsRef = collection(firestore, 'avatars');
    const q = query(avatarsRef, where('isTaken', '==', false));
    const snapshot = await getDocs(q);

    const avatars = snapshot.docs.map((doc) => {
      const data = doc.data();
      const { url } = data;

      return {
        id: doc.id,
        url,
      };
    });

    return NextResponse.json(
      {
        message: status[status.OK],
        data: avatars,
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
