'use client';

import { useCalendar } from '@/features/calendar/components';
import { computePositionFromTime } from '@/features/calendar/utils/day';
import * as React from 'react';

const useDayViewPosition = (startAt: Date, endAt: Date) => {
  const calendar = useCalendar();
  const view = calendar.useWatch((s) =>
    s.currentView.compositeId ? s.currentView.compositeId() : s.currentView.id,
  );

  return React.useMemo(() => {
    return computePositionFromTime(startAt, endAt, calendar);
  }, [startAt, endAt, calendar, view]);
};

export { useDayViewPosition };
