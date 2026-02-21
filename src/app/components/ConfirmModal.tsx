'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  description,
  confirmText,
  cancelText,
  isLoading = false,
}: ConfirmModalProps) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ px: 4, pt: 4 }}>
        {description && <Typography variant="h5">{description}</Typography>}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 4 }}>
        <Button
          variant="contained"
          onClick={onClose}
          size="small"
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.secondary.light,
            },
          }}
          disabled={isLoading}
        >
          {cancelText}
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          size="small"
          disabled={isLoading}
          sx={{
            backgroundColor: theme.custom.colors.pink,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
          }}
        >
          {isLoading ? <CircularProgress size={18} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
