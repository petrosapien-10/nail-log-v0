import { configureStore } from '@reduxjs/toolkit';
import { publicApiSlice } from './publicApiSlice';
import { secureApiSlice } from './secureApiSlice';

// ----------------------------------------------------------------------

export const makeStore = () => {
  return configureStore({
    reducer: {
      [publicApiSlice.reducerPath]: publicApiSlice.reducer,
      [secureApiSlice.reducerPath]: secureApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(publicApiSlice.middleware).concat(secureApiSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
