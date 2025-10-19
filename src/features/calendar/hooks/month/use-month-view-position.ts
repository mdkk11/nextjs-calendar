'use client';

import { useCalendar } from '@/features/calendar/components';
import { computePositionFromTime } from '@/features/calendar/utils/month';
import * as React from 'react';

const useMonthViewPosition = (date: Date) => {
  const calendar = useCalendar();
  const view = calendar.useWatch((s) =>
    s.currentView.compositeId ? s.currentView.compositeId() : s.currentView.id,
  );

  return React.useMemo(() => {
    return computePositionFromTime(date, calendar);
  }, [date, calendar, view]);
};

export { useMonthViewPosition };
