import { useMemo } from "react";

import { useMonthWheelNavigation } from "@/hooks/useMonthWheelNavigation";
import { useCalendarStore } from "@/store/calendarStore";
import { formatMonthTitle, getCalendarCells } from "@/utils/calendar";
import { groupEventsByDate } from "@/utils/calendarEvents";

export const useCalendarMonthController = () => {
  const {
    events,
    goNextMonth,
    goPreviousMonth,
    goToday,
    selectDate,
    selectedDate,
    visibleMonth,
  } = useCalendarStore();
  const onMonthWheel = useMonthWheelNavigation({
    onNextMonth: goNextMonth,
    onPreviousMonth: goPreviousMonth,
  });

  const cells = useMemo(
    () => getCalendarCells(visibleMonth, selectedDate),
    [selectedDate, visibleMonth],
  );
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  return {
    cells,
    eventsByDate,
    monthTitle: formatMonthTitle(visibleMonth),
    onMonthWheel,
    onNextMonth: goNextMonth,
    onPreviousMonth: goPreviousMonth,
    onSelectDate: selectDate,
    onToday: goToday,
  };
};
