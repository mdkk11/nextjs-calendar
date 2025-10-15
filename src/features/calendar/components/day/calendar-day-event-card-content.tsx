'use client';

import { VariantProps } from '@/components/ui';
import { useCalendar } from '@/features/calendar/components/calendar';
import { CalendarEvent } from '@/features/calendar/types';
import { cn } from '@/libs';
import * as React from 'react';
import { calendarEventCardVariants } from '../calendar-event-card';

interface CalendarDayEventCardContentProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof calendarEventCardVariants>, 'color'> {
  event: CalendarEvent;
}

const CalendarDayEventCardContent = React.forwardRef<
  HTMLDivElement,
  CalendarDayEventCardContentProps
>(({ event, className, ...props }, ref) => {
  const calendar = useCalendar();
  const formatters = calendar.getFormatters();

  return (
    <div
      ref={ref}
      className={cn(
        'pointer-events-none relative flex h-full w-full flex-col overflow-hidden rounded-[calc(var(--calendar-radius)/2)] p-2 shadow-md select-none',
        calendarEventCardVariants({
          color: event.color,
          className,
        }),
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <h3 className="text-[.65rem] leading-tight font-semibold">
          {event.summary || '(Untitled)'}
        </h3>
      </div>
      <div>
        <p className="text-[.6rem] leading-tight">
          {formatters.time(event.startAt)} - {formatters.time(event.endAt)}
        </p>
      </div>
    </div>
  );
});
CalendarDayEventCardContent.displayName = 'CalendarDayEventCardContent';

export { CalendarDayEventCardContent };
