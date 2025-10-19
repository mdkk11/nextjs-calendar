'use client';

import {
  CalendarDayEventCardContent,
  CalendarDaysViewTemplate,
} from '@/features/calendar/components/day';
import { CalendarEvent } from '@/features/calendar/types';
import { createCalendarView } from '@/libs/calendar';
import { addDays, getRangeDays } from '@/utils/time';

const VIEW_ID = 'range';
type CalendarRangeMeta = {
  days: number;
  chip: React.ComponentType<{ event: CalendarEvent }>;
};
type CalendarRangeConfiguration = {
  days?: number;
  chip?: React.ComponentType<{ event: CalendarEvent }>;
};

const view = createCalendarView<typeof VIEW_ID, CalendarRangeMeta, CalendarRangeConfiguration>({
  id: VIEW_ID,
  compositeId() {
    return `${this.id}-${this.meta.days}`;
  },
  content: CalendarDaysViewTemplate,
  viewDatesFn(date) {
    return getRangeDays(date, this.meta.days).map((date) => ({
      date,
      isOutside: false,
    }));
  },
  increaseFn(date) {
    return addDays(date, this.meta.days);
  },
  decreaseFn(date) {
    return addDays(date, -this.meta.days);
  },
  meta: {
    days: 1,
    chip: CalendarDayEventCardContent,
  },
  configure(props) {
    const { chip, days } = props;

    if (chip) {
      this.meta.chip = chip;
    }

    if (days) {
      this.meta.days = days;
    }

    return this;
  },
});

export { view as CalendarRangeView };
