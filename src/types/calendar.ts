export type CalendarEventType = "deep" | "light" | "routine";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  type: CalendarEventType;
};

export type ScheduleDraft = {
  title: string;
  startAt: string;
  endAt: string;
};

export type CalendarCell = {
  key: string;
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};
