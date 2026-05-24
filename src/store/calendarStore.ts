import { create } from "zustand";

import { mockEvents } from "@/data/mockEvents";
import type { CalendarEvent } from "@/types/calendar";
import { addMonths, getStartOfMonth, toDateKey } from "@/utils/calendar";

type CalendarState = {
  visibleMonth: Date;
  selectedDate: Date;
  timelineOpen: boolean;
  events: CalendarEvent[];
  selectDate: (date: Date) => void;
  goToday: () => void;
  goPreviousMonth: () => void;
  goNextMonth: () => void;
  toggleTimeline: () => void;
};

const initialSelectedDate = new Date(2026, 4, 24);

export const useCalendarStore = create<CalendarState>((set) => ({
  visibleMonth: getStartOfMonth(initialSelectedDate),
  selectedDate: initialSelectedDate,
  timelineOpen: true,
  events: mockEvents,
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
    set((state) => ({
      visibleMonth: addMonths(state.visibleMonth, -1),
    })),
  goNextMonth: () =>
    set((state) => ({
      visibleMonth: addMonths(state.visibleMonth, 1),
    })),
  toggleTimeline: () =>
    set((state) => ({
      timelineOpen: !state.timelineOpen,
    })),
}));

export const getEventsByDate = (events: CalendarEvent[], date: Date) => {
  const key = toDateKey(date);

  return events
    .filter((event) => event.date === key)
    .sort((left, right) => left.start.localeCompare(right.start));
};
