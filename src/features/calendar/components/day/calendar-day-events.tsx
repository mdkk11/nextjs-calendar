'use client';

import { useCalendar } from '@/features/calendar/components/calendar';
import { CalendarEventCard } from '@/features/calendar/components/calendar-event-card';

import { useDateFragments } from '@/features/calendar/hooks';
import { useDayViewPosition } from '@/features/calendar/hooks/day';
import { CalendarEventWithOverlap } from '@/features/calendar/types';
import * as React from 'react';

interface CalendarDayEventProps {
  startAt: Date;
  endAt: Date;
  event: CalendarEventWithOverlap;
}

const CalendarDayEvent = React.memo<CalendarDayEventProps>(({ startAt, endAt, event }) => {
  const position = useDayViewPosition(startAt, endAt);
  const calendar = useCalendar();
  const Chip = React.useMemo(
    () => calendar.getCurrentView().meta.chip as typeof CalendarEventCard,
    [calendar],
  );

  return (
    <CalendarEventCard
      event={event}
      style={{
        position: 'absolute',
        ...position,
        left: `calc(${position.left} + var(--calendar-overlap-size, 5%) * ${event.overlap})`,
        width: `calc(${position.width} - var(--calendar-overlap-size, 5%) * ${event.overlap})`,
      }}
    >
      <Chip event={event} />
    </CalendarEventCard>
  );
});

interface CalendarDayEventFragmentsProps {
  event: CalendarEventWithOverlap;
}

const CalendarDayEventFragments = React.memo<CalendarDayEventFragmentsProps>(({ event }) => {
  const fragments = useDateFragments(event.startAt, event.endAt);

  return (
    <React.Fragment>
      {fragments.map((fragment) => (
        <CalendarDayEvent
          key={fragment.id}
          startAt={fragment.startAt}
          endAt={fragment.endAt}
          event={event}
        />
      ))}
    </React.Fragment>
  );
});

interface CalendarDayEventsProps {}

const CalendarDayEvents = React.memo<CalendarDayEventsProps>(() => {
  const calendar = useCalendar();
  const events = calendar.useViewEvents();

  return (
    <React.Fragment>
      {events.map((event) => (
        <CalendarDayEventFragments key={event.id} event={event} />
      ))}
    </React.Fragment>
  );
});
CalendarDayEvents.displayName = 'CalendarDayEvents';

export { CalendarDayEvents };
