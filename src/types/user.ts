import { FirestoreTimestamp } from './firestore';
import { Session } from './session';
import { Ticket } from './ticket';

export interface LiteUser {
  id: string;
  name: string;
  image?: string;
  basicSalaryRate: number;
}
export interface UserWithSessions extends LiteUser {
  sessions: (Session & { tickets: Ticket[] })[];
}

export interface UserWithSession extends User {
  session: Session & { tickets: Ticket[] };
}

export interface User {
  id: string;
  name: string;
  phone: string;
  image?: string;
  basicSalaryRate: number;
  ticketBonusRate: number;
  dailyBonusMinThreshold: number;
  isDeleted: boolean;
  dob: string;
  address: string;
  createdAt: FirestoreTimestamp;
}
export interface UserPayload {
  id?: string;
  name: string;
  phone: string;
  dob: string;
  address: string;
  basicSalaryRate: string;
  ticketBonusRate: string;
  dailyBonusMinThreshold: string;
  image?: string;
}

export type UserUpdatePayload = Partial<{
  name: string;
  phone: string;
  dob: string;
  address: string;
  basicSalaryRate: number;
  ticketBonusRate: number;
  dailyBonusMinThreshold: number;
  image: string;
}>;
