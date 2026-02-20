import { firestore } from '@/lib/firebase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import status from 'http-status';
import { Expense } from '@/types/expense';

export async function GET(_: Request, context: { params: Promise<{ expenseId?: string }> }) {
  const { expenseId } = await context.params;

  try {
    // checker
    if (!expenseId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const expenseRef = doc(firestore, 'expenses', expenseId);
    const snapshot = await getDoc(expenseRef);

    if (!snapshot.exists()) {
      throw new Error(status[status.NOT_FOUND]);
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    const message = (error as Error).message;
    let statusCode;

    switch (message) {
      case status[status.BAD_REQUEST]:
        statusCode = status.BAD_REQUEST;
        break;

      case status[status.NOT_FOUND]:
        statusCode = status.NOT_FOUND;
        break;

      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json(
      {
        message,
      },
      { status: statusCode }
    );
  }
}

// ----------------------------------------------------------------------

type EditableExpenseFields = Pick<Expense, 'description' | 'amount'>;

export async function PATCH(req: Request, context: { params: Promise<{ expenseId?: string }> }) {
  const { expenseId } = await context.params;

  try {
    if (!expenseId) throw new Error(status[status.BAD_REQUEST]);

    const data = await req.json();

    const hasDescription = 'description' in data;
    const hasAmount = 'amount' in data;

    if (
      (!hasDescription && !hasAmount) ||
      (hasDescription && (typeof data.description !== 'string' || !data.description.trim())) ||
      (hasAmount && (typeof data.amount !== 'number' || isNaN(data.amount)))
    ) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const updatePayload: Partial<EditableExpenseFields> = {};
    if (hasDescription) updatePayload.description = data.description.trim();
    if (hasAmount) updatePayload.amount = data.amount;

    const expenseRef = doc(firestore, 'expenses', expenseId);
    await updateDoc(expenseRef, updatePayload);

    return NextResponse.json({ id: expenseId, ...updatePayload });
  } catch (error) {
    const message = (error as Error).message;
    let statusCode;

    switch (message) {
      case status[status.BAD_REQUEST]:
        statusCode = status.BAD_REQUEST;
        break;

      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }
}

// ----------------------------------------------------------------------

export async function DELETE(_: Request, context: { params: Promise<{ expenseId?: string }> }) {
  const { expenseId } = await context.params;

  try {
    if (!expenseId) {
      throw new Error(status[status.BAD_REQUEST]);
    }

    const expenseRef = doc(firestore, 'expenses', expenseId);

    await deleteDoc(expenseRef);

    return NextResponse.json(
      {
        message: status[status.OK],
        data: { id: expenseId },
      },
      { status: status.OK }
    );
  } catch (error) {
    const message = (error as Error).message;
    let statusCode;

    switch (message) {
      case status[status.BAD_REQUEST]:
        statusCode = status.BAD_REQUEST;
        break;

      default:
        statusCode = status.INTERNAL_SERVER_ERROR;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }
}
