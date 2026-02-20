import { FirestoreTimestamp } from './firestore';

export interface TicketPayment {
  amount: number;
  method: string;
}

export interface TicketData {
  payments: { method: string; amount: number }[];
  isBonus: boolean;
}
export interface Ticket {
  id: string;
  payments: TicketPayment[];
  isBonus: boolean;
  createdAt: FirestoreTimestamp;
  totalAmount: number;
  bonusAmount: number;
}
