import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '@/types/user';
import { Session } from '@/types/session';
import { Ticket } from '@/types/ticket';
import { History } from '@/types/history';
import { Expense } from '@/types/expense';
import { UserWithSession } from '@/types/user';
import { NewExpenseInput } from '@/types/newExpenseInput';

//-----------------------------------------------------------------------

export const publicApiSlice = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-type', 'application/json');
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // users
    getAllUsers: builder.query<User[], void>({
      query: () => 'users/',
      transformResponse: (response: { message: string; data: User[] }) => response.data,
    }),
    getUser: builder.query<User, string>({
      query: (userId) => `users/${userId}`,
    }),
    getUserSessions: builder.query<Session[], string>({
      query: (userId) => `users/${userId}/sessions/`,
    }),
    getUserSession: builder.query<Session, { userId: string; sessionId: string }>({
      query: ({ userId, sessionId }) => `users/${userId}/sessions/${sessionId}/`,
    }),

    getSessionTickets: builder.query<Ticket[], { userId: string; sessionId: string }>({
      query: ({ userId, sessionId }) => `users/${userId}/sessions/${sessionId}/tickets/`,
      transformResponse: (reponse: { data: Ticket[] }) => reponse.data,
    }),
    getTicket: builder.query<Ticket, { userId: string; sessionId: string; ticketId: string }>({
      query: ({ userId, sessionId, ticketId }) =>
        `users/${userId}/sessions/${sessionId}/tickets/${ticketId}`,
    }),
    createTicket: builder.mutation<
      Ticket,
      {
        userId: string;
        sessionId: string;
        data: Omit<Ticket, 'id' | 'createdAt' | 'totalAmount' | 'bonusAmount'>;
      }
    >({
      query: ({ userId, sessionId, data }) => ({
        url: `users/${userId}/sessions/${sessionId}/tickets/`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteTicket: builder.mutation<
      { id: string },
      { userId: string; sessionId: string; ticketId: string }
    >({
      query: ({ userId, sessionId, ticketId }) => ({
        url: `users/${userId}/sessions/${sessionId}/tickets/${ticketId}/`,
        method: 'DELETE',
      }),
    }),
    updateTicket: builder.mutation<
      Ticket,
      {
        userId: string;
        sessionId: string;
        ticketId: string;
        data: {
          payments: { method: string; amount: number }[];
          isBonus: boolean;
        };
      }
    >({
      query: ({ userId, sessionId, ticketId, data }) => ({
        url: `users/${userId}/sessions/${sessionId}/tickets/${ticketId}/`,
        method: 'PATCH',
        body: data,
      }),
    }),

    getHistoryByDate: builder.query<History[], string>({
      query: (dateString) => `history/?date=${dateString}`,
      transformResponse: (response: { message: string; data: History[] }) => response.data,
    }),

    createHistory: builder.mutation<void, Omit<History, 'id' | 'createdAt' | 'performedBy'>>({
      query: (history) => ({
        url: 'history/',
        method: 'POST',
        body: history,
      }),
    }),

    // expenses
    getAllExpenses: builder.query<Expense[], void>({
      query: () => 'expenses/',
    }),

    getExpensesByDate: builder.query<Expense[], string>({
      query: (dateString) => `expenses/?date=${dateString}`,
      transformResponse: (res: { message: string; data: Expense[] }) => res.data,
    }),

    createExpense: builder.mutation<Expense, NewExpenseInput>({
      query: (data) => ({
        url: 'expenses/',
        method: 'POST',
        body: data,
      }),
    }),

    updateExpense: builder.mutation<
      Expense,
      { expenseId: string; data: Partial<Pick<Expense, 'description' | 'amount'>> }
    >({
      query: ({ expenseId, data }) => ({
        url: `expenses/${expenseId}/`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteExpense: builder.mutation<{ id: string }, string>({
      query: (expenseId) => ({
        url: `expenses/${expenseId}/`,
        method: 'DELETE',
      }),
    }),

    // session
    createSession: builder.mutation<
      Session,
      { userId: string; data: { date: string; timeZone: string } }
    >({
      query: ({ userId, data }) => ({
        url: `users/${userId}/sessions/`,
        method: 'POST',
        body: data,
      }),
    }),

    updateSessionTime: builder.mutation<
      void,
      {
        userId: string;
        sessionId: string;
        data: Partial<{
          checkIn: string;
          checkOut: string;
        }>;
      }
    >({
      query: ({ userId, sessionId, data }) => ({
        url: `users/${userId}/sessions/${sessionId}/`,
        method: 'PATCH',
        body: data,
      }),
    }),

    getSessionsByDate: builder.query<UserWithSession[], { date: string; timeZone: string }>({
      query: ({ date, timeZone }) => `sessions/?date=${date}&timeZone=${timeZone}`,
      transformResponse: (response: { message: string; data: UserWithSession[] }) => response.data,
    }),

    //login
    validateDashboardPassword: builder.mutation<
      { success: boolean; message: string; version: string },
      { password: string }
    >({
      query: (body) => ({
        url: '/login/',
        method: 'POST',
        body,
      }),
    }),

    //login session check
    getDashboardSession: builder.query<
      {
        success: boolean;
        version: string;
        updatedAt: number;
        expiresAt: number;
        createdAt: { seconds: number; nanoseconds: number };
      },
      void
    >({
      query: () => ({
        url: '/login/',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useGetUserSessionsQuery,
  useGetUserSessionQuery,
  useGetSessionTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useGetHistoryByDateQuery,
  useCreateHistoryMutation,
  useGetAllExpensesQuery,
  useCreateSessionMutation,
  useGetSessionsByDateQuery,
  useUpdateSessionTimeMutation,
  useDeleteTicketMutation,
  useUpdateTicketMutation,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpensesByDateQuery,
  useValidateDashboardPasswordMutation,

  useGetDashboardSessionQuery,
} = publicApiSlice;
