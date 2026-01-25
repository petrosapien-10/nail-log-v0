'use client';

import React, { useState } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersActionBarAction } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { YYYYMMDD } from '@/types/date';
import { SxProps, Theme, useTheme } from '@mui/material/styles';

const DATE_FORMAT = 'ddd, MMM D';
const PARAM_FORMAT = 'YYYY-MM-DD';
const DATE_ACTIONS: PickersActionBarAction[] = ['cancel', 'accept', 'today'];

interface DateSelectorProps {
  selectedDate: Date;
  onChange: (date: Dayjs, dateString: YYYYMMDD) => void;
  label?: string;
  format?: string;
  sx?: SxProps<Theme>;
}

export default function DateSelector({
  selectedDate,
  onChange,
  label,
  format,
  sx,
}: DateSelectorProps) {
  const theme = useTheme();
  const [tempDate, setTempDate] = useState<Dayjs | null>(dayjs(selectedDate));

  const handleDateAccept = (date: Dayjs | null) => {
    if (date) {
      const chosenDateString = date.format(PARAM_FORMAT) as YYYYMMDD;
      onChange(date, chosenDateString);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={tempDate}
        onChange={(newDate) => setTempDate(newDate)}
        onAccept={handleDateAccept}
        format={format || DATE_FORMAT}
        closeOnSelect={false}
        slotProps={{
          textField: {
            variant: 'outlined',
            label: label ?? (dayjs(selectedDate).isSame(dayjs(), 'day') ? 'Today' : undefined),
            sx: {
              maxWidth: 312,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                fontFamily: theme.typography.fontFamily,
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              },

              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },

              '& .MuiInputBase-input': {
                fontSize: theme.typography.h3.fontSize,
                fontFamily: theme.typography.fontFamily,
                lineHeight: 1.2,
                paddingTop: '10px',
                color: theme.palette.text.primary,
              },

              '& .MuiInputLabel-root': {
                backgroundColor: theme.palette.background.paper,
                fontSize: theme.typography.h5.fontSize,
                top: 1,
                left: -3,
                fontFamily: theme.typography.fontFamily,
                borderRadius: '4px',
                padding: '0 4px',
                color: theme.palette.text.primary,
              },

              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },

              '& .MuiSvgIcon-root': {
                marginTop: '2px',
                color: theme.palette.text.primary,
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.custom.colors.slateDark,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.custom.colors.slateDark,
              },
              ...sx,
            },
          },
          actionBar: {
            actions: DATE_ACTIONS,
            sx: {
              gap: 1,
              mt: -4,
              mb: 2,
              px: 2,
              paddingTop: 0,
              paddingBottom: 1,
              '& .MuiButton-root': {
                color: theme.palette.text.primary,
              },
              '& .MuiButton-root:nth-of-type(1)': {
                backgroundColor: theme.palette.secondary.light,
              },
              '& .MuiButton-root:nth-of-type(2)': {
                backgroundColor: theme.custom.colors.pink,
              },
              '& .MuiButton-root:nth-of-type(3)': {
                backgroundColor: theme.palette.secondary.light,
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
