'use client';

import { Calendar, CalendarContent } from '@/features/calendar/components/calendar'
import { CalendarDayView } from '@illostack/react-calendar-day';
import { CalendarMonthView } from '@illostack/react-calendar-month';
import { CalendarRangeView } from '@illostack/react-calendar-range';
import { CalendarWeekView } from '@illostack/react-calendar-week';
import { useTheme } from 'next-themes';
import { parseAsIsoDate, parseAsNumberLiteral, parseAsStringEnum, useQueryStates } from 'nuqs';
import * as React from 'react';

import { useFakeApi } from "@/features/calendar/hooks"

export default function Page({
  params,
}: Readonly<{
  params: Promise<{
    locale: string;
  }>;
}>) {
  const { locale } = React.use(params);
¥  const { theme = 'system' } = useTheme();

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
      translations={{
        calendar: {
          days: {
            0: 'Sun',
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thu',
            5: 'Fri',
            6: 'Sat',
          },
          months: {
            0: 'January',
            1: 'February',
            2: 'March',
            3: 'April',
            4: 'May',
            5: 'June',
            6: 'July',
            7: 'August',
            8: 'September',
            9: 'October',
            10: 'November',
            11: 'December',
          },
        },
        literals: {
          day: 'Day',
          days: 'Days',
          week: 'Week',
          month: 'Month',
          year: 'Year',
          today: 'Today',
          previous: 'Previous',
          next: 'Next',
          range: 'Range',
          more: 'More',
          'go-to': 'Go to',
        },
        form: {
          save: 'Save',
        },
        action: {
          'create-event': 'Create Event',
          'update-event': 'Update Event',
          'delete-event': 'Delete Event',
          'duplicate-event': 'Duplicate Event',
          'copy-event': 'Copy Event',
          'cut-event': 'Cut Event',
          'paste-event': 'Paste Event',
          undo: 'Undo',
        },
        message: {
          'event-created': 'Event created',
          'event-updated': 'Event updated',
          'event-deleted': 'Event deleted',
          'event-restored': 'Event restored',
          'event-duplicated': 'Event duplicated',
          'event-copied': 'Event copied',
          'event-cutted': 'Event cut',
          'event-pasted': 'Event pasted',
          'event-not-found': 'Event not found',
        },
      }}
      toasterTheme={theme as 'light' | 'dark' | 'system'}
    >
      {/* <SidebarProvider> */}
        {/* <SidebarLeft />
        <SidebarInset> */}
          {/* <AppHeader /> */}
          <header>
            <h1>HEADER</h1>
          </header>
          <CalendarContent />
        {/* </SidebarInset> */}
      {/* </SidebarProvider> */}
    </Calendar>
  );
}
