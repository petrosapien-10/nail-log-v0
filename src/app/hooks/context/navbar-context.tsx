'use client';

import { YYYYMMDD } from '@/types/date';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState } from 'react';

const DATE_FORMAT = 'YYYY-MM-DD';

type RefetchEntry = {
  fetcher?: () => void;
  isFetching?: boolean;
};

export type RefetchMap = {
  sessions?: RefetchEntry;
  expenses?: RefetchEntry;
  users?: RefetchEntry;
  dashboardLoginSession?: RefetchEntry;
};

type NavbarContextType = {
  selectedDate: Date;
  selectedDateString: YYYYMMDD;
  setSelectedDate: (date: Date, dateString: YYYYMMDD) => void;

  selectedRange: { start: Date; end: Date };
  selectedRangeString: { start: string; end: string };
  setSelectedRange: (range: { start: Date; end: Date }) => void;

  isUserModalOpen: boolean;
  openUserModal: () => void;
  closeUserModal: () => void;
  isHistoryModalOpen: boolean;
  openHistoryModal: () => void;
  closeHistoryModal: () => void;

  goToProfilesPage: () => void;
  goToAdminPage: () => void;

  refetchMap: RefetchMap;
  setRefetchMap: React.Dispatch<React.SetStateAction<RefetchMap>>;
};

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState(new Date());
  const [selectedDateString, setSelectedDateString] = useState<YYYYMMDD>(
    dayjs(new Date()).format(DATE_FORMAT) as YYYYMMDD
  );

  const setSelectedDate = (date: Date, dateString: YYYYMMDD) => {
    setSelectedDateState(date);
    setSelectedDateString(dateString);
  };

  const goToAdminPage = () => {
    router.push('/admin');
  };

  const [selectedRange, setSelectedRangeState] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date(),
  });

  const [selectedRangeString, setSelectedRangeString] = useState<{
    start: string;
    end: string;
  }>({
    start: dayjs().format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  });

  const setSelectedRange = (range: { start: Date; end: Date }) => {
    setSelectedRangeState(range);
    setSelectedRangeString({
      start: dayjs(range.start).format('YYYY-MM-DD'),
      end: dayjs(range.end).format('YYYY-MM-DD'),
    });
  };

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [refetchMap, setRefetchMap] = useState<RefetchMap>({});

  const openUserModal = () => setUserModalOpen(true);
  const closeUserModal = () => setUserModalOpen(false);

  const openHistoryModal = () => setHistoryModalOpen(true);
  const closeHistoryModal = () => setHistoryModalOpen(false);

  const router = useRouter();
  const goToProfilesPage = () => {
    router.push('/admin/profiles');
  };

  return (
    <NavbarContext.Provider
      value={{
        selectedDate,
        selectedDateString,
        setSelectedDate,

        selectedRange,
        selectedRangeString,
        setSelectedRange,

        isUserModalOpen,
        openUserModal,
        closeUserModal,
        isHistoryModalOpen,
        openHistoryModal,
        closeHistoryModal,

        goToProfilesPage,
        goToAdminPage,

        refetchMap,
        setRefetchMap,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbarContext() {
  const context = useContext(NavbarContext);
  if (!context)
    throw new Error(
      '[NavbarContext] useNavbarContext must be used within a <NavbarProvider>. ' +
        'Make sure your component is wrapped with <NavbarProvider> in the component tree.'
    );
  return context;
}
