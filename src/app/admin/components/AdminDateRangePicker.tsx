import React, { useState, useRef, useEffect } from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTheme } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const DATE_FORMAT_DOT = 'DD.MM.YYYY';
const DATE_FORMAT_DASH = 'DD-MM-YYYY';

const customStaticRanges = createStaticRanges([
  {
    label: 'Yesterday',
    range: () => {
      const yesterday = dayjs().subtract(1, 'day').toDate();
      return { startDate: yesterday, endDate: yesterday };
    },
  },
  {
    label: 'Today',
    range: () => {
      const today = dayjs().toDate();
      return { startDate: today, endDate: today };
    },
  },
  {
    label: 'Last Month',
    range: () => {
      const start = dayjs().subtract(1, 'month').startOf('month').toDate();
      const end = dayjs().subtract(1, 'month').endOf('month').toDate();
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'This Month',
    range: () => {
      const start = dayjs().startOf('month').toDate();
      const end = dayjs().toDate();
      return { startDate: start, endDate: end };
    },
  },
]);

type DateRange = {
  startDate: Date;
  endDate: Date;
  key: string;
};

interface TestDateRangePickerProps {
  selectedRange: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }, formatted: { start: string; end: string }) => void;
}

export function TestDateRangePicker({ selectedRange, onChange }: TestDateRangePickerProps) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const defaultRange = {
    start: new Date(),
    end: new Date(),
  };

  const dateRangeState = [
    {
      startDate: selectedRange?.start ?? defaultRange.start,
      endDate: selectedRange?.end ?? defaultRange.end,
      key: 'selection',
    },
  ];

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRange = () => {
    const { startDate, endDate } = dateRangeState[0];

    const isSameDay = dayjs(startDate).isSame(endDate, 'day');

    return isSameDay
      ? dayjs(startDate).format(DATE_FORMAT_DOT)
      : `${dayjs(startDate).format(DATE_FORMAT_DOT)} - ${dayjs(endDate).format(DATE_FORMAT_DOT)}`;
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          height: theme.spacing(7),
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 2,
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: '#fff',
          width: theme.spacing(44),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 500 }}>
          {formatRange()}
        </Typography>
        <EventIcon />
      </Box>

      {open && (
        <div style={{ position: 'absolute', zIndex: 1000 }}>
          <DateRangePicker
            ranges={dateRangeState}
            onChange={(item: { selection: DateRange }) => {
              const selection = item.selection;
              const start = dayjs(selection.startDate).format(DATE_FORMAT_DASH);
              const end = dayjs(selection.endDate).format(DATE_FORMAT_DASH);

              onChange({ start: selection.startDate, end: selection.endDate }, { start, end });

              const isRangeSelected =
                selection.startDate &&
                selection.endDate &&
                selection.startDate.getTime() !== selection.endDate.getTime();

              if (isRangeSelected) {
                setOpen(false);
              }
            }}
            moveRangeOnFirstSelection={false}
            showSelectionPreview={true}
            staticRanges={customStaticRanges}
            inputRanges={[]}
            rangeColors={[primaryColor]}
          />
        </div>
      )}
    </div>
  );
}
