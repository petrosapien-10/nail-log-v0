'use client';

import { IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
export type SortField = 'totalSalary' | 'sharedBonus' | 'dailyBonus' | 'basicSalary' | 'hours';
export type SortOrder = 'asc' | 'desc';

interface AdminSortToggleIconProps {
  field: SortField;
  active: boolean;
  currentOrder: SortOrder;
  onChange: (field: SortField, order: SortOrder) => void;
}

export default function AdminSortToggleIcon({
  field,
  active,
  currentOrder,
  onChange,
}: AdminSortToggleIconProps) {
  const nextOrder: SortOrder = active && currentOrder === 'asc' ? 'desc' : 'asc';

  return (
    <IconButton size="small" onClick={() => onChange(field, nextOrder)} sx={{ ml: 0.5 }}>
      {active && currentOrder === 'asc' ? (
        <ArrowDropUpIcon fontSize="small" />
      ) : (
        <ArrowDropDownIcon fontSize="small" />
      )}
    </IconButton>
  );
}
