'use client';

import { Box, Chip, Container } from '@mui/material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useNavbarContext } from '../hooks/context/navbar-context';
import DateSelector from '../admin/components/DateSelector';
import CheckInButton from '../dashboard/components/CheckInButton';
import HistoryButton from '../dashboard/components/HistoryButton';
import RefreshButton from '../dashboard/components/RefreshButton';
import ProfilesButton from '../admin/components/ProfilesButton';
import PasswordMenu from '../admin/components/PasswordMenu';

import { usePathname } from 'next/navigation';
import { useAuthContext } from '../hooks/context/AuthContext';
import { TestDateRangePicker } from '../admin/components/AdminDateRangePicker';
import BackButton from '../admin/components/BackButton';
import AdminSignOutButton from '../admin/components/AdminSignOutButton';
import dayjs from 'dayjs';
import { YYYYMMDD } from '@/types/date';
import { useTheme } from '@mui/material/styles';
import PasswordExpiryInfo from '../admin/components/PasswordExpiryInfo';
import { useGetDashboardSessionQuery } from '../store/publicApiSlice';

type DateRange = { start: Date; end: Date };
type FormattedRange = { start: string; end: string };

type AdminProfilesNavbarProps = {
  handleRefreshData: () => void;
  isRefreshing: boolean;
  goToAdminPage: () => void;
};

function AdminProfilesNavbar({
  handleRefreshData,
  isRefreshing,
  goToAdminPage,
}: AdminProfilesNavbarProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDirection={{ xs: 'column', sm: 'row' }}
      gap={{ xs: 2, sm: 0 }}
    >
      <BackButton onClick={goToAdminPage} />
      <Box display="flex" gap={4} flexWrap="wrap">
        <RefreshButton onClick={handleRefreshData} isLoading={isRefreshing} />
        <AdminSignOutButton />
      </Box>
    </Box>
  );
}

type AdminMainNavbarProps = {
  selectedRange: DateRange;
  setSelectedRange: (range: DateRange, formatted: FormattedRange) => void;
  handleRefreshData: () => void;
  isRefreshing: boolean;
  goToProfilesPage: () => void;
};

function AdminMainNavbar({
  selectedRange,
  setSelectedRange,
  handleRefreshData,
  isRefreshing,
  goToProfilesPage,
}: AdminMainNavbarProps) {
  const {
    data: sessionData,
    refetch: refetchExpiryInfo,
    isFetching: isFetchingExpiryInfo,
  } = useGetDashboardSessionQuery();
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <TestDateRangePicker
          selectedRange={selectedRange}
          onChange={(range, formatted) => {
            setSelectedRange(range, formatted);
          }}
        />

        <Box display="flex" gap={2} flexWrap="wrap">
          <RefreshButton onClick={handleRefreshData} isLoading={isRefreshing} />
          <ProfilesButton onClick={goToProfilesPage} />
          <PasswordMenu onRefetchExpiryInfo={refetchExpiryInfo} />
          <AdminSignOutButton />
        </Box>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        {sessionData && (
          <PasswordExpiryInfo
            data={sessionData}
            isRefreshing={isFetchingExpiryInfo}
            onRefetch={refetchExpiryInfo}
          />
        )}
      </Box>
    </>
  );
}

type UserDashboardNavbarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date, dateString: YYYYMMDD) => void;
  isReadOnly: boolean;
  isRefreshing: boolean;
  openUserModal: () => void;
  openHistoryModal: () => void;
  handleRefreshData: () => void;
  isAdminUser: boolean;
};

function UserDashboardNavbar({
  selectedDate,
  setSelectedDate,
  isReadOnly,
  isRefreshing,
  openUserModal,
  openHistoryModal,
  handleRefreshData,
  isAdminUser,
}: UserDashboardNavbarProps) {
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <DateSelector
          selectedDate={selectedDate}
          onChange={(date, dateString) => setSelectedDate(date.toDate(), dateString)}
        />
        <Box display="flex" gap={2} flexWrap="wrap">
          <RefreshButton onClick={handleRefreshData} isLoading={isRefreshing} />
          <CheckInButton onClick={openUserModal} isReadOnly={isReadOnly} />
          <HistoryButton onClick={openHistoryModal} />
        </Box>
      </Box>

      {isAdminUser && (
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Chip
            label="Admin mode"
            size="small"
            color="warning"
            variant="outlined"
            icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}
    </>
  );
}

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  const { isAuthenticated, isAdmin } = useAuthContext();

  const {
    selectedDate,
    setSelectedDate,

    openUserModal,
    openHistoryModal,

    goToProfilesPage,
    goToAdminPage,

    refetchMap,

    selectedRange,
    setSelectedRange,
  } = useNavbarContext();

  const handleRefreshSessionsAndExpensesData = () => {
    refetchMap?.sessions?.fetcher?.();
    refetchMap?.expenses?.fetcher?.();
    refetchMap?.dashboardLoginSession?.fetcher?.();
  };

  const handleRefreshUserProfilesData = () => {
    refetchMap?.users?.fetcher?.();
  };

  const isToday = dayjs().isSame(dayjs(selectedDate), 'day');
  const isReadOnly = !isToday && !isAdmin;

  const isRefreshing =
    !!refetchMap?.expenses?.isFetching ||
    !!refetchMap?.sessions?.isFetching ||
    !!refetchMap?.users?.isFetching ||
    !!refetchMap?.dashboardLoginSession?.isFetching;

  const isProfilesPage = pathname.startsWith('/admin/profiles');

  const showAdminView = isAdminRoute && isAuthenticated && isAdmin && !isProfilesPage;

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        width: '100%',
        maxWidth: theme.spacing(122.5),
        margin: '0 auto',
        px: { xs: 2, sm: 4 },
        mb: 2,
        pb: 2,
        pt: 4,
      }}
    >
      {isProfilesPage ? (
        <AdminProfilesNavbar
          handleRefreshData={handleRefreshUserProfilesData}
          isRefreshing={isRefreshing}
          goToAdminPage={goToAdminPage}
        />
      ) : showAdminView ? (
        <AdminMainNavbar
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          handleRefreshData={handleRefreshSessionsAndExpensesData}
          isRefreshing={isRefreshing}
          goToProfilesPage={goToProfilesPage}
        />
      ) : (
        <UserDashboardNavbar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isReadOnly={isReadOnly}
          isRefreshing={isRefreshing}
          openUserModal={openUserModal}
          openHistoryModal={openHistoryModal}
          handleRefreshData={handleRefreshSessionsAndExpensesData}
          isAdminUser={isAuthenticated && isAdmin}
        />
      )}
    </Container>
  );
}
