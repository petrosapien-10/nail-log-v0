import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase';
import { User, UserWithSessions } from '@/types/user';
import { Expense } from '@/types/expense';

export const secureApiSlice = createApi({
  reducerPath: 'secureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin/',
    prepareHeaders: async (headers) => {
      headers.set('Content-Type', 'application/json');
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['AdminSessions', 'AdminExpenses', 'Users', 'Avatars'],
  keepUnusedDataFor: 60,

  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: 'users/',
        method: 'GET',
      }),
      transformResponse: (response: { message: string; data: User[] }) => response.data,
    }),

    createUser: builder.mutation<User, Omit<User, 'id' | 'createdAt'>>({
      query: (newUserData) => ({
        url: 'users/',
        method: 'POST',
        body: newUserData,
      }),
    }),

    updateUser: builder.mutation<void, { userId: string; data: Partial<User> }>({
      query: ({ userId, data }) => ({
        url: `users/${userId}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `users/${userId}`,
        method: 'DELETE',
      }),
    }),

    getAllAvatars: builder.query<{ id: string; url: string }[], void>({
      query: () => ({
        url: 'avatars/',
        method: 'GET',
      }),
      transformResponse: (response: { message: string; data: { id: string; url: string }[] }) =>
        response.data,
    }),

    updateAvatarStatus: builder.mutation<void, { avatarId: string; isTaken: boolean }>({
      query: ({ avatarId, isTaken }) => ({
        url: `avatars/${avatarId}`,
        method: 'PATCH',
        body: { isTaken },
      }),
    }),

    getSessions: builder.query<
      UserWithSessions[],
      { start: string; end: string; timeZone: string }
    >({
      query: (params) => {
        const query = new URLSearchParams(params).toString();
        return `sessions/?${query}`;
      },
      transformResponse: (response: {
        message: string;
        data: UserWithSessions[];
      }): UserWithSessions[] => response.data,
      providesTags: ['AdminSessions'],
    }),

    deleteSession: builder.mutation<void, { userId: string; sessionId: string }>({
      query: ({ userId, sessionId }) => ({
        url: `users/${userId}/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminSessions'],
    }),

    getExpensesByRange: builder.query<Expense[], { start: string; end: string }>({
      query: (params) => {
        const query = new URLSearchParams(params).toString();
        return `expenses/?${query}`;
      },
      transformResponse: (response: { message: string; data: Expense[] }): Expense[] =>
        response.data,
      providesTags: ['AdminExpenses'],
    }),

    createDashboardPassword: builder.mutation<
      { success: boolean; message: string; updatedAt: number; version: string },
      { password: string }
    >({
      query: (body) => ({
        url: 'password/',
        method: 'POST',
        body,
      }),
    }),

    extendDashboardSession: builder.mutation<
      { success: boolean; message: string; newExpiresAt: number },
      void
    >({
      query: () => ({
        url: 'password/',
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useGetAllAvatarsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUpdateAvatarStatusMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
  useGetExpensesByRangeQuery,
  useCreateDashboardPasswordMutation,
  useExtendDashboardSessionMutation,
} = secureApiSlice;
