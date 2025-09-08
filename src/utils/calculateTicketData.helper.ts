import { firestore } from '@/lib/firebase';
import { getDoc, doc, Timestamp } from 'firebase/firestore';

export async function calculateTicketData({
  userId,
  payments,
  isBonus,
}: {
  userId: string;
  payments: { method: string; amount: number }[];
  isBonus: boolean;
}) {
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const userDoc = await getDoc(doc(firestore, 'users', userId));
  const ticketBonusRate = userDoc.exists() ? userDoc.data().ticketBonusRate || 0 : 0;

  const bonusAmount = isBonus ? totalAmount * ticketBonusRate : 0;

  return {
    payments,
    isBonus,
    totalAmount,
    bonusAmount,
    createdAt: Timestamp.fromDate(new Date()),
  };
}
