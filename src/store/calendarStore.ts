import { create } from "zustand";

import { mockEvents } from "@/data/mockEvents";
import type { CalendarEvent } from "@/types/calendar";
import { addMonthsClamped, getStartOfMonth, toDateKey } from "@/utils/calendar";

type CalendarState = {
  visibleMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  selectDate: (date: Date) => void;
  goToday: () => void;
  goPreviousMonth: () => void;
  goNextMonth: () => void;
};

const initialSelectedDate = new Date(2026, 4, 24);

export const useCalendarStore = create<CalendarState>((set) => ({
  visibleMonth: getStartOfMonth(initialSelectedDate),
  selectedDate: initialSelectedDate,
  events: mockEvents,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  selectDate: (date) =>
    set({
      selectedDate: date,
      visibleMonth: getStartOfMonth(date),
    }),
  goToday: () => {
    const today = new Date();

    set({
      selectedDate: today,
      visibleMonth: getStartOfMonth(today),
    });
  },
  goPreviousMonth: () =>
    set((state) => {
      const selectedDate = addMonthsClamped(state.selectedDate, -1);

      return {
        selectedDate,
        visibleMonth: getStartOfMonth(selectedDate),
      };
    }),
  goNextMonth: () =>
    set((state) => {
      const selectedDate = addMonthsClamped(state.selectedDate, 1);

      return {
        selectedDate,
        visibleMonth: getStartOfMonth(selectedDate),
      };
    }),
}));

export const getEventsByDate = (events: CalendarEvent[], date: Date) => {
  const key = toDateKey(date);

  return events
    .filter((event) => event.date === key)
    .sort((left, right) => left.start.localeCompare(right.start));
};
