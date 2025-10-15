'use client';

import { useCalendar } from '@/features/calendar/components';

import { useDateFragments } from '@/features/calendar/hooks';
import { useDayViewPosition } from '@/features/calendar/hooks/day';
import { CalendarSection } from '@/features/calendar/types';
import * as React from 'react';

interface CalendarDayActiveSectionIndicatorProps {
  startAt: Date;
  endAt: Date;
  activeSection: CalendarSection;
}

const CalendarDayActiveSectionIndicator = React.memo<CalendarDayActiveSectionIndicatorProps>(
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
CalendarDayActiveSectionIndicator.displayName = 'CalendarDayActiveSectionIndicator';

interface CalendarDayActiveSectionProps {}

const CalendarDayActiveSection = React.memo<CalendarDayActiveSectionProps>(() => {
  const calendar = useCalendar();
  const activeSection = calendar.useWatch((s) => s.activeSection);
  const fragments = useDateFragments(activeSection?.startAt, activeSection?.endAt);

  if (!activeSection) {
    return null;
  }

  return (
    <React.Fragment>
      {fragments.map((fragment) => (
        <CalendarDayActiveSectionIndicator
          key={fragment.id}
          startAt={fragment.startAt}
          endAt={fragment.endAt}
          activeSection={activeSection}
        />
      ))}
    </React.Fragment>
  );
});
CalendarDayActiveSection.displayName = 'CalendarDayActiveSection';

export { CalendarDayActiveSection };
