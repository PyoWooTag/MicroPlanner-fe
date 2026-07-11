import type { CalendarEvent } from "@/types/calendar";
import { toDateKey } from "@/utils/calendar";

export const groupEventsByDate = (events: CalendarEvent[]) =>
  events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] ?? []), event];
    return acc;
  }, {});

export const getEventsByDate = (events: CalendarEvent[], date: Date) => {
  const key = toDateKey(date);

  return events
    .filter((event) => event.date === key)
    .sort((left, right) => left.start.localeCompare(right.start));
};
