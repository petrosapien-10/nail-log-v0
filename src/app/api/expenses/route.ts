import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';

async function getAllExpenses() {
  const expensesRef = collection(firestore, 'expenses');
  const snapshot = await getDocs(expensesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getExpensesByDate(dateParam: string) {
  const expensesRef = collection(firestore, 'expenses');
  const targetDate = new Date(dateParam);

  if (isNaN(targetDate.getTime())) {
    throw new Error(status[status.BAD_REQUEST]);
  }

  const startOfDay = Timestamp.fromDate(new Date(targetDate.setHours(0, 0, 0, 0)));
  const endOfDay = Timestamp.fromDate(new Date(targetDate.setHours(23, 59, 59, 999)));

  const expensesQuery = query(
    expensesRef,
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay)
  );

  const snapshot = await getDocs(expensesQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  try {
    const expenses = date ? await getExpensesByDate(date) : await getAllExpenses();

    return NextResponse.json(
      {
        message: status[status.OK],
        data: expenses,
      },
      { status: status.OK }
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

export async function POST(req: Request) {
  try {
    const { description, amount, date } = await req.json();

    if (
      typeof description !== 'string' ||
      typeof amount !== 'number' ||
      typeof date !== 'string' ||
      isNaN(new Date(date).getTime())
    ) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const newExpense = {
      description,
      amount,
      date: Timestamp.fromDate(new Date(date)),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(firestore, 'expenses'), newExpense);

    return NextResponse.json(
      {
        message: status[status.CREATED],
        data: { id: docRef.id, ...newExpense },
      },
      { status: status.CREATED }
    );
  } catch (error) {
    const message = (error as Error).message;
    const isBadRequest = message === status[status.BAD_REQUEST];

    return NextResponse.json(
      { message },
      { status: isBadRequest ? status.BAD_REQUEST : status.INTERNAL_SERVER_ERROR }
    );
  }
}
