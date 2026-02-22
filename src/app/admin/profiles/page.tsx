'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/app/hooks/context/AuthContext';
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '@/app/store/secureApiSlice';
import { Box, CircularProgress, Container, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';
import ProfileCard from '../components/ProfileCard';
import SnackbarMessage from '@/app/components/SnackBarMessage';
import AddUserModal from '../components/AddUserModal';
import { User, UserPayload } from '@/types/user';
import { ModalMode } from '@/types/modalMode';
import ConfirmModal from '@/app/components/ConfirmModal';
import { RefetchMap, useNavbarContext } from '@/app/hooks/context/NavbarContext';

const mapUserToUserPayload = (user: User): UserPayload => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  dob: user.dob,
  address: user.address,
  basicSalaryRate: user.basicSalaryRate.toString(),
  ticketBonusRate: (user.ticketBonusRate * 100).toFixed(2),
  dailyBonusMinThreshold: user.dailyBonusMinThreshold.toString(),
  image: user.image || '',
});

export default function ProfilesPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslate();

  const { isAuthenticated, isAdmin, loading } = useAuthContext();
  const { setRefetchMap } = useNavbarContext();

  const {
    data: users,
    isError,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useGetAllUsersQuery(undefined, {
    skip: !isAuthenticated || loading,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    setRefetchMap((prev: RefetchMap) => ({
      ...prev,
      users: {
        ...prev.users,
        isFetching: isFetchingUsers,
        fetcher: refetchUsers,
      },
    }));
  }, [isFetchingUsers, refetchUsers, setRefetchMap]);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPayload | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.Add);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, loading, router]);
  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode(ModalMode.Add);
    setIsModalOpen(true);
  };
  const handleOpenUserModal = (user: User, mode: ModalMode.Edit | ModalMode.View) => {
    setSelectedUser(mapUserToUserPayload(user));
    setModalMode(mode);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (newEmployeeData: UserPayload) => {
    try {
      const payload = {
        ...newEmployeeData,
        basicSalaryRate: Number(newEmployeeData.basicSalaryRate),
        ticketBonusRate: Number(newEmployeeData.ticketBonusRate) / 100,
        dailyBonusMinThreshold: Number(newEmployeeData.dailyBonusMinThreshold),
        isDeleted: false,
      };

      await createUser(payload).unwrap();
      setSuccessMessage(
        t('employee_name_has_been_added_successfully', { name: newEmployeeData.name })
      );

      refetchUsers();
      setIsModalOpen(false);
    } catch {
      setErrorMessage(
        t('failed_to_add_employee_name_please_try_again', { name: newEmployeeData.name })
      );
    }
  };

  const handleUpdateUser = async (updatedUserData: UserPayload) => {
    if (!updatedUserData.id) return;

    try {
      const userPayload = {
        name: updatedUserData.name,
        phone: updatedUserData.phone,
        dob: updatedUserData.dob,
        address: updatedUserData.address,
        basicSalaryRate: Number(updatedUserData.basicSalaryRate),
        ticketBonusRate: Number(updatedUserData.ticketBonusRate) / 100,
        dailyBonusMinThreshold: Number(updatedUserData.dailyBonusMinThreshold),
        image: updatedUserData.image,
      };

      await updateUser({ userId: updatedUserData.id, data: userPayload }).unwrap();

      setSuccessMessage(
        t('employee_name_has_been_updated_successfully', { name: updatedUserData.name })
      );
      refetchUsers();
      setIsModalOpen(false);
    } catch {
      setErrorMessage(
        t('failed_to_update_employee_name_please_try_again', { name: updatedUserData.name })
      );
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id).unwrap();
      setSuccessMessage(t('user_name_was_deleted_successfully', { name: userToDelete.name }));
      refetchUsers();
    } catch {
      setErrorMessage(t('failed_to_delete_user_name', { name: userToDelete.name }));
    } finally {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{t('failed_to_load_users')}</Typography>
      </Container>
    );
  }

  return (
    <>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteUser}
        description={
          userToDelete
            ? t('are_you_sure_you_want_to_delete_name_this_action_cannot_be_undone', {
                name: userToDelete.name,
              })
            : ''
        }
        confirmText={t('confirm')}
        cancelText={t('cancel')}
        isLoading={isDeleting}
      />
      <SnackbarMessage
        open={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
        severity="success"
      />
      <SnackbarMessage
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
        severity="error"
      />
      <AddUserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={modalMode === ModalMode.Edit ? handleUpdateUser : handleSaveUser}
        isLoading={isCreating || isUpdating}
        initialData={selectedUser}
        mode={modalMode}
      />

      <Container
        disableGutters
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: theme.spacing(122.5),
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <Box
          pb={4}
          sx={{
            backgroundColor: theme.custom.colors.slateLight,
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: 'column', sm: 'row' }}
            px={3}
            pt={2}
            mb={2}
          >
            <Typography variant="h3">{t('employee_list')}</Typography>

            <IconButton
              onClick={handleAddUser}
              aria-label={t('employee')}
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: theme.custom.colors.darkPink,
                color: theme.palette.text.primary,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={`repeat(auto-fit, minmax(${theme.spacing(32.5)}, 1fr))`}
            gap={2}
            px={3}
            py={3}
          >
            {isFetchingUsers ? (
              <Box display="flex" justifyContent="center" width="100%">
                <CircularProgress size={36} color="inherit" />
              </Box>
            ) : (
              users
                ?.filter((user) => !user.isDeleted)
                .map((user) => (
                  <ProfileCard
                    key={user.id}
                    user={user}
                    onEdit={() => handleOpenUserModal(user, ModalMode.Edit)}
                    onDelete={() => handleDeleteUser(user)}
                  />
                ))
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}
