'use client';

import { useCalendar } from '@/features/calendar/components';
import { useDateFragments } from '@/features/calendar/hooks';
import { useDayViewPosition } from '@/features/calendar/hooks/day';
import { CalendarSection } from '@/features/calendar/types';
import React from 'react';

interface CalendarDayActiveSelectionContentProps {
  startAt: Date;
  endAt: Date;
  selection: CalendarSection;
}

const CalendarDayActiveSelectionContent = React.memo<CalendarDayActiveSelectionContentProps>(
  ({ startAt, endAt }) => {
    const position = useDayViewPosition(startAt, endAt);

    return (
      <div
        className="pointer-events-none absolute bg-[hsl(var(--calendar-primary)/0.1)]"
        style={{ ...position }}
      />
    );
  },
);
CalendarDayActiveSelectionContent.displayName = 'CalendarDayActiveSelectionContent';

interface CalendarDayActiveSelectionProps {}

const CalendarDayActiveSelection = React.memo<CalendarDayActiveSelectionProps>(() => {
  const calendar = useCalendar();
  const selection = calendar.useWatch((s) => s.selection);
  const fragments = useDateFragments(selection?.startAt, selection?.endAt);

  if (!selection) {
    return null;
  }

  return (
    <React.Fragment>
      {fragments.map((fragment) => (
        <CalendarDayActiveSelectionContent
          key={fragment.id}
          startAt={fragment.startAt}
          endAt={fragment.endAt}
          selection={selection}
        />
      ))}
    </React.Fragment>
  );
});
CalendarDayActiveSelection.displayName = 'CalendarDayActiveSelection';

export { CalendarDayActiveSelection };
