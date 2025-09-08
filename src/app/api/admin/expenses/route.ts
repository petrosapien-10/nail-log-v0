import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';

// ----------------------------------------------------------------------

// GET /admin/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: status[status.UNAUTHORIZED] },
      { status: status.UNAUTHORIZED }
    );
  }

  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!startParam || !endParam) {
    throw new Error(status[status.BAD_REQUEST]);
  }

  try {
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const startOfDay = Timestamp.fromDate(new Date(startDate.setHours(0, 0, 0, 0)));
    const endOfDay = Timestamp.fromDate(new Date(endDate.setHours(23, 59, 59, 999)));

    const expensesRef = collection(firestore, 'expenses');
    const expensesQuery = query(
      expensesRef,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(
      {
        message: status[status.OK],
        data: expenses,
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
