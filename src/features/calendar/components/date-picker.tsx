'use client';

import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { useCalendar } from '@/features/calendar/components/calendar';

export function DatePicker() {
  const calendar = useCalendar();

  const dates = calendar.useWatch((state) => state.dates).filter((d) => !d.isOutside);
  const date = calendar.useWatch((state) => state.date);
  const view = calendar.useWatch((state) => state.view);

  const selected = React.useMemo(() => {
    const firstDay = dates.at(0)?.date as Date;
    const lastDay = dates.at(-1)?.date as Date;

    return {
      from: firstDay,
      to: lastDay,
    };
  }, [dates]);

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          key={date.toISOString() + view}
          mode="range"
          selected={selected}
          defaultMonth={date}
          weekStartsOn={0}
          onDayClick={(day) => calendar.changeDate(day)}
          className="[&_td:has([role=gridcell].bg-primary)]:bg-sidebar-foreground/10 [&_[role=gridcell].bg-primary]:text-sidebar-foreground [&_[role=gridcell].bg-accent]:!bg-sidebar-primary [&_[role=gridcell].bg-accent]:!text-sidebar-primary-foreground [&_[role=gridcell]]:!bg-transparent [&_[role=gridcell].bg-accent]:!rounded-md [&_[role=gridcell].bg-primary]:rounded-none"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
