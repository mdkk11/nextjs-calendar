'use client';

import { Calendar, CalendarContent } from '@/features/calendar/components/calendar';

import { useTheme } from 'next-themes';
import { parseAsIsoDate, parseAsNumberLiteral, parseAsStringEnum, useQueryStates } from 'nuqs';
import * as React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/features/calendar/components/app-header';
import { CalendarDayView } from '@/features/calendar/components/day';
import { CalendarMonthView } from '@/features/calendar/components/month/calendar-month-view';
import { CalendarRangeView } from '@/features/calendar/components/range';
import { CalendarWeekView } from '@/features/calendar/components/week';
import { useFakeApi } from '@/features/calendar/hooks';
import { CALENDAR_TRANSLATIONS } from '@/libs/calendar';

export default function Page({
  params,
}: Readonly<{
  params: Promise<{
    locale: string;
  }>;
}>) {
  const { locale } = React.use(params);
  const { theme = 'system' } = useTheme();

  const { events, createEvent, deleteEvent, updateEvent } = useFakeApi();

  const [{ view, days, date }, setState] = useQueryStates({
    view: parseAsStringEnum(['day', 'week', 'month', 'range']).withDefault('day'),
    days: parseAsNumberLiteral([1, 2, 3, 4, 5, 6, 7, 8, 9]).withDefault(1),
    date: parseAsIsoDate.withDefault(new Date()),
  });

  const views = React.useMemo(
    () => [
      CalendarDayView,
      CalendarWeekView,
      CalendarRangeView.configure({ days }),
      CalendarMonthView,
    ],
    [days],
  );

  return (
    <Calendar
      views={views}
      initialView={view}
      events={events}
      initialDate={date}
      weekStartsOn={locale === 'es' ? 1 : 0}
      locale={locale}
      onViewChange={(view) => {
        const { id, meta } = view;

        setState({
          view: id,
          days: ('days' in meta ? meta.days : 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        });
      }}
      minutesPerRow={15}
      rowHeight={24}
      startHour={0}
      endHour={23}
      onDateChange={(date) => {
        setState({ date });
      }}
      onEventCreate={createEvent}
      onEventUpdate={updateEvent}
      onEventDelete={deleteEvent}
      onRestoreEvent={createEvent}
      translations={CALENDAR_TRANSLATIONS}
      toasterTheme={theme as 'light' | 'dark' | 'system'}
    >
      <SidebarProvider>
        <SidebarInset>
          <AppHeader />
          <CalendarContent />
        </SidebarInset>
      </SidebarProvider>
    </Calendar>
  );
}
