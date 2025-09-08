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
} from '@mui/material';
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
import { useTheme } from '@mui/material/styles';
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
  const { data: expenses = [], isLoading, refetch } = useGetExpensesByDateQuery(formattedDate);

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

      await refetch();
      setEditedExpenses({});
      setNewExpenses([]);

      if (createResults.length > 0) {
        logAction(HistoryActionType.AddExpense, 'Added expense(s)', undefined);
      }
      if (updateResults.length > 0) {
        logAction(HistoryActionType.EditExpense, 'Edited expense(s)', undefined);
      }

      onSuccess(t('dashboard.stat_card.total_expenses.update_expense_success'));
      onClose();
    } catch {
      onError(t('dashboard.stat_card.total_expenses.update_expense_fail'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id).unwrap();
      setExpenseToDelete(null);
      await refetch();
      onSuccess(t('dashboard.stat_card.total_expenses.delete_expense_success'));
      logAction(HistoryActionType.DeleteExpense, 'Deleted expense', undefined);
    } catch {
      onError(t('dashboard.stat_card.total_expenses.delete_expense_fail'));
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
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '8px',
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
        placeholder={t('dashboard.stat_card.total_expenses.description_placeholder')}
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
    </Stack>
  ));

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle variant="h3" fontWeight="bold" sx={{ px: 4, pt: 6 }}>
        {t('dashboard.stat_card.total_expenses.add_expenses')}
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 4 }}>
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
                <Button
                  disabled={isReadOnly}
                  size="large"
                  onClick={() =>
                    setNewExpenses((prev) => [...prev, { description: '', amount: '' }])
                  }
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  }}
                >
                  {t('dashboard.stat_card.total_expenses.expense_button')}
                </Button>
              </Box>

              <Divider />

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  value={t('dashboard.stat_card.total_expenses.total_label')}
                  variant="standard"
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                      disableUnderline: true,
                      sx: { fontWeight: 'bold' },
                    },
                  }}
                  sx={{
                    flexGrow: 1,
                    maxWidth: 'calc(98% - 140px - 42px)',
                  }}
                />
                <TextField
                  value={totalExpenses}
                  variant="outlined"
                  size="small"
                  sx={{ flexBasis: theme.spacing(15), flexShrink: 0 }}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      sx: { fontWeight: 'bold' },
                    },
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  }}
                >
                  {t('dashboard.stat_card.total_expenses.cancel_button')}
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
                    t('dashboard.stat_card.total_expenses.save_button')
                  )}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <Dialog open={Boolean(expenseToDelete)} onClose={() => setExpenseToDelete(null)}>
        <DialogTitle>{t('dashboard.stat_card.total_expenses.confirm_delete')}</DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              fullWidth
              size="xsmall"
              variant="contained"
              onClick={() => setExpenseToDelete(null)}
              disabled={isDeleting}
              sx={{
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.text.primary,
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
