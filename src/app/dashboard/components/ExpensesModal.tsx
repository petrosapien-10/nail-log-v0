'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  Divider,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Chip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  useGetExpensesByDateQuery,
  useDeleteExpenseMutation,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '@/app/store/publicApiSlice';
import { Expense } from '@/types/expense';
import dayjs from 'dayjs';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import { handleNumberInputKeyDown } from '@/utils/handleNumberInputKeyDown';
import { sanitizeAmount } from '@/utils/sanitizeAmount';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { HistoryActionType } from '@/types/history';
import { alpha, useTheme } from '@mui/material/styles';
import { YYYYMMDD } from '@/types/date';

const DATE_FORMAT = 'YYYY-MM-DD';

interface ExpensesModalProps {
  isReadOnly: boolean;
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  totalExpenses: number;
  logAction: (type: HistoryActionType, description: string, userId?: string) => void;
}

export default function ExpensesModal({
  isReadOnly,
  open,
  onClose,
  selectedDate,
  onSuccess,
  onError,
  totalExpenses,
  logAction,
}: ExpensesModalProps) {
  const { t } = useTranslate();
  const theme = useTheme();

  const formattedDate = dayjs(selectedDate).format(DATE_FORMAT) as YYYYMMDD;
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const { data: expenses = [], isLoading } = useGetExpensesByDateQuery(formattedDate, {
    refetchOnMountOrArgChange: 45,
    refetchOnFocus: false,
  });

  const [editedExpenses, setEditedExpenses] = useState<Record<string, Partial<Expense>>>({});
  const [newExpenses, setNewExpenses] = useState<{ description: string; amount: string }[]>([]);
  const hasChanges =
    Object.keys(editedExpenses).length > 0 || newExpenses.some((e) => e.description && e.amount);

  useEffect(() => {
    if (!isLoading && expenses.length === 0 && newExpenses.length === 0) {
      setNewExpenses([{ description: '', amount: '' }]);
    }
  }, [isLoading, expenses.length, newExpenses.length]);

  const handleChange = (id: string, field: keyof Expense, value: string | number) => {
    setEditedExpenses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'amount' ? parseFloat(String(value)) : value,
      },
    }));
  };

  const handleCancel = () => {
    setEditedExpenses({});
    setNewExpenses([]);
    onClose();
  };

  const handleSave = async () => {
    try {
      const updates = Object.entries(editedExpenses).map(([id, data]) =>
        updateExpense({ expenseId: id, data }).unwrap()
      );

      const creations = newExpenses
        .filter((e) => e.description && e.amount)
        .map((e) =>
          createExpense({
            date: selectedDate.toISOString(),
            description: e.description,
            amount: parseFloat(e.amount),
          }).unwrap()
        );

      const [updateResults, createResults] = await Promise.all([
        Promise.all(updates),
        Promise.all(creations),
      ]);

      setEditedExpenses({});
      setNewExpenses([]);

      if (createResults.length > 0) {
        logAction(HistoryActionType.AddExpense, 'Added expense(s)', undefined);
      }
      if (updateResults.length > 0) {
        logAction(HistoryActionType.EditExpense, 'Edited expense(s)', undefined);
      }

      onSuccess(t('expense_updated_successfully'));
      onClose();
    } catch {
      onError(t('failed_to_update_expense'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id).unwrap();
      setExpenseToDelete(null);
      onSuccess(t('expense_deleted_successfully'));
      logAction(HistoryActionType.DeleteExpense, 'Deleted expense', undefined);
    } catch {
      onError(t('failed_to_delete_expense'));
    }
  };

  const renderedExpenses = expenses.map((expense) => {
    const isEdited = editedExpenses[expense.id] ?? {};
    const descriptionValue = isEdited.description ?? expense.description;
    const amountValue =
      isEdited.amount !== undefined ? String(isEdited.amount) : expense.amount.toFixed(2);

    return (
      <Stack
        key={expense.id}
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <TextField
          value={descriptionValue}
          onChange={(e) => handleChange(expense.id, 'description', e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <TextField
          type="number"
          placeholder="00.00"
          value={amountValue}
          onChange={(e) => handleChange(expense.id, 'amount', sanitizeAmount(e.target.value))}
          onKeyDown={handleNumberInputKeyDown}
          sx={{ width: 120 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            },
          }}
        />
        <IconButton
          disabled={isReadOnly}
          onClick={() => setExpenseToDelete(expense)}
          edge="end"
          aria-label="delete"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
          }}
        >
          <DeleteOutlinedIcon fontSize="medium" />
        </IconButton>
      </Stack>
    );
  });

  const renderedNewExpenses = newExpenses.map((expense, index) => (
    <Stack
      key={`new-${index}`}
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <TextField
        value={expense.description}
        onChange={(e) =>
          setNewExpenses((prev) => {
            const updated = [...prev];
            updated[index].description = e.target.value;
            return updated;
          })
        }
        placeholder={t('write_the_new_expense_here')}
        variant="outlined"
        size="small"
        sx={{ flexGrow: 1 }}
      />
      <TextField
        type="number"
        placeholder="00.00"
        value={expense.amount}
        onChange={(e) =>
          setNewExpenses((prev) => {
            const updated = [...prev];
            updated[index].amount = sanitizeAmount(e.target.value);
            return updated;
          })
        }
        onKeyDown={handleNumberInputKeyDown}
        sx={{ width: 120 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          },
        }}
      />
      {!(expenses.length === 0 && newExpenses.length === 1) && (
        <IconButton
          disabled={isReadOnly}
          onClick={() => setNewExpenses((prev) => prev.filter((_, i) => i !== index))}
          edge="end"
          aria-label="delete"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
          }}
        >
          <DeleteOutlinedIcon fontSize="medium" />
        </IconButton>
      )}
    </Stack>
  ));

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle
        variant="h3"
        fontWeight="bold"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          pt: 3,
          pb: 1,
        }}
      >
        {t('add_expenses')}
        <IconButton onClick={handleCancel} aria-label="Close" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Stack spacing={2} sx={{ pt: 1, pb: 2 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderedExpenses}
              {renderedNewExpenses}

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  disabled={isReadOnly}
                  onClick={() =>
                    setNewExpenses((prev) => [...prev, { description: '', amount: '' }])
                  }
                  aria-label={t('expense')}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: theme.custom.colors.pink,
                    color: theme.palette.text.primary,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                    '&:hover': { backgroundColor: theme.palette.primary.light },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Divider />

              <Box
                sx={{
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.error.main,
                    theme.custom.surfaces.balance.netBgStartOpacity
                  )} 0%, ${alpha(
                    theme.custom.colors.slateLight,
                    theme.custom.surfaces.balance.netBgEndOpacity
                  )} 100%)`,
                  border: `1px solid ${alpha(
                    theme.palette.error.main,
                    theme.custom.surfaces.balance.netBorderOpacity
                  )}`,
                  px: 1.75,
                  py: 1.1,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={900} color={theme.palette.error.main}>
                    {t('total_expenses')}
                  </Typography>
                  <Chip
                    size="medium"
                    label={`€ ${Number(totalExpenses).toFixed(2)}`}
                    sx={{
                      backgroundColor: alpha(
                        theme.palette.error.main,
                        theme.custom.surfaces.balance.netChipBgOpacity
                      ),
                      color: theme.palette.error.main,
                      fontWeight: 800,
                      px: 0.5,
                    }}
                  />
                </Stack>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.light,
                    },
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    backgroundColor: theme.custom.colors.pink,
                    color: theme.palette.text.primary,
                    '&:hover': { backgroundColor: theme.palette.primary.light },
                  }}
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating || isCreating}
                >
                  {isUpdating || isCreating ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    t('save')
                  )}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <Dialog open={Boolean(expenseToDelete)} onClose={() => setExpenseToDelete(null)}>
        <DialogTitle>{t('are_you_sure_you_want_to_delete_this_expense')}</DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              fullWidth
              size="xsmall"
              variant="contained"
              onClick={() => setExpenseToDelete(null)}
              disabled={isDeleting}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.light,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              size="xsmall"
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
              }}
            >
              {isDeleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
