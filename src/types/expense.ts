import { FirestoreTimestamp } from './firestore';

// ----------------------------------------------------------------------

export interface Expense {
  id: string;
  createdAt: FirestoreTimestamp;
  date: FirestoreTimestamp;
  amount: number;
  description: string;
}
