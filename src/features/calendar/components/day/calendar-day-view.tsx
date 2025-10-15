'use client';

import React from 'react';

import { useCalendar } from '@/features/calendar/components/calendar';
import {
  useCalendarDayDrag,
  useCalendarDayInteraction,
  useCalendarDayResize,
  useCalendarDaySelection,
} from '@/features/calendar/hooks/day';
import { CalendarEvent } from '@/features/calendar/types';
import { mergeRefs } from '@/libs';
import { createCalendarView } from '@/libs/calendar';
import { addDays } from '@/utils/time';
import { CalendarDayActiveDrag } from './calendar-day-active-drag';
import { CalendarDayActiveResize } from './calendar-day-active-resize';
import { CalendarDayActiveSection } from './calendar-day-active-section';
import { CalendarDayActiveSelection } from './calendar-day-active-selection';
import { CalendarDayAxis } from './calendar-day-axis';
import { CalendarDayContextMenu } from './calendar-day-context-menu';
import { CalendarDayEventCardContent } from './calendar-day-event-card-content';
import { CalendarDayEvents } from './calendar-day-events';
import { CalendarDayHeader } from './calendar-day-header';
import { CalendarDayTimeIndicator } from './calendar-day-time-indicator';

interface CalendarDayViewProps extends React.HTMLAttributes<HTMLDivElement> {}

const CalendarDaysViewTemplate = React.forwardRef<HTMLDivElement, CalendarDayViewProps>(
  (props, ref) => {
    const calendar = useCalendar();
    const dates = calendar.useWatch((s) => s.dates);
    const selectionRef = useCalendarDaySelection();
    const resizeRef = useCalendarDayResize();
    const interactionRef = useCalendarDayInteraction();
    const dragRef = useCalendarDayDrag();

    calendar.useViewAnimation();
    calendar.useViewAutoScroll();

    return (
      <div ref={ref} {...props}>
        <CalendarDayHeader dates={dates} />
        <div
          className="relative w-full pl-20 select-none"
          style={{
            height: calendar.getLayout().calendarHeight,
          }}
        >
          <CalendarDayAxis dates={dates} />
          <CalendarDayContextMenu>
            <div
              className="relative h-full w-full"
              ref={mergeRefs(selectionRef, resizeRef, interactionRef, dragRef)}
            >
              <CalendarDayTimeIndicator />
              <CalendarDayActiveSection />
              <CalendarDayActiveSelection />
              <CalendarDayEvents />
              <CalendarDayActiveResize />
              <CalendarDayActiveDrag />
            </div>
          </CalendarDayContextMenu>
        </div>
      </div>
    );
  },
);
CalendarDaysViewTemplate.displayName = 'CalendarDaysViewTemplate';

const VIEW_ID = 'day';
type CalendarDayMeta = {
  chip: React.ComponentType<{ event: CalendarEvent }>;
};
type CalendarDayConfiguration = {
  chip?: React.ComponentType<{ event: CalendarEvent }>;
};

const view = createCalendarView<typeof VIEW_ID, CalendarDayMeta, CalendarDayConfiguration>({
  id: VIEW_ID,
  content: CalendarDaysViewTemplate,
  viewDatesFn(date) {
    return [{ date: date, isOutside: false }];
  },
  increaseFn(date) {
    return addDays(date, 1);
  },
  decreaseFn(date) {
    return addDays(date, -1);
  },
  meta: {
    chip: CalendarDayEventCardContent,
  },
  configure(props) {
    const { chip } = props;

    if (chip) {
      this.meta.chip = chip;
    }

    return this;
  },
});

export { CalendarDaysViewTemplate, view as CalendarDayView };
