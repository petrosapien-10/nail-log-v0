import { FirestoreTimestamp } from './firestore';

// ----------------------------------------------------------------------

export interface Session {
  id: string;
  date: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;

  checkIn: string;
  checkOut: string;

  basicIncome: number;
  ticketBonusIncome: number;
  dailyBonusIncome: number;
  totalSalary: number;

  totalIncome: number;

  dailyBonusMinThreshold: number;

  basicSalaryRate: number;
  hours: number;
}
