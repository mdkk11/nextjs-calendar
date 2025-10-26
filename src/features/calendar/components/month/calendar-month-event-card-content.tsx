'use client';

import { calendarEventCardVariants } from '@/components/ui/calendar-event-card';
import { useCalendar } from '@/features/calendar/components/calendar';
import { CalendarEvent } from '@/features/calendar/types';
import { cn } from '@/libs';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';

interface CalendarMonthEventCardContentProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof calendarEventCardVariants>, 'color'> {
  event: CalendarEvent;
}

const CalendarMonthEventCardContent = React.forwardRef<
  HTMLDivElement,
  CalendarMonthEventCardContentProps
>(({ event, className, ...props }, ref) => {
  const calendar = useCalendar();
  const formatters = calendar.getFormatters();

  return (
    <div
      ref={ref}
      className={cn(
        'pointer-events-none relative flex h-full w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-[calc(var(--calendar-radius)*0.5)] p-2 text-[0.7rem] shadow-md select-none [&_div:first-child]:line-clamp-1 [&_div:first-child]:flex-grow [&_div:last-child]:flex-none',
        calendarEventCardVariants({
          color: event.color,
          className,
        }),
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <h3 className="leading-tight font-semibold">{event.summary || '(タイトル無し)'}</h3>
      </div>
      <div>
        <p className="text-[.6rem] leading-tight">
          {formatters.time(event.startAt)} - {formatters.time(event.endAt)}
        </p>
      </div>
    </div>
  );
});
CalendarMonthEventCardContent.displayName = 'CalendarMonthEventCardContent';

export { CalendarMonthEventCardContent };
