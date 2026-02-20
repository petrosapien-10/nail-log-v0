import { FirestoreTimestamp } from './firestore';

export enum HistoryActionType {
  CheckIn = 'checkIn',
  CheckOut = 'checkOut',
  EditCheckIn = 'editCheckIn',
  EditCheckOut = 'editCheckOut',

  AddTicket = 'addTicket',
  EditTicket = 'editTicket',
  DeleteTicket = 'deleteTicket',

  AddExpense = 'addExpense',
  EditExpense = 'editExpense',
  DeleteExpense = 'deleteExpense',

  DeleteSession = 'deleteSession',
}
export interface History {
  id: string;
  createdAt: FirestoreTimestamp;
  actionType: HistoryActionType;
  performedBy?: string;
  description: string;
  userId?: string;
}
