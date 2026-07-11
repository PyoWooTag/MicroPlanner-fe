import { create } from "zustand";

import { mockEvents } from "@/data/mockEvents";
import type { CalendarEvent } from "@/types/calendar";
import { addMonths, getStartOfMonth } from "@/utils/calendar";

type CalendarState = {
  visibleMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
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
  updateEvent: (event) =>
    set((state) => ({
      events: state.events.map((current) =>
        current.id === event.id ? event : current,
      ),
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
      const visibleMonth = addMonths(state.visibleMonth, -1);

      return {
        visibleMonth,
      };
    }),
  goNextMonth: () =>
    set((state) => {
      const visibleMonth = addMonths(state.visibleMonth, 1);

      return {
        visibleMonth,
      };
    }),
}));
