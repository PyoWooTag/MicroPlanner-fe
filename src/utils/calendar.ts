import type { CalendarCell } from "@/types/calendar";

export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getStartOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const addMonthsClamped = (date: Date, amount: number) => {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + amount;
  const lastDateOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDate = Math.min(date.getDate(), lastDateOfTargetMonth);

  return new Date(targetYear, targetMonth, targetDate);
};

export const getCalendarCells = (
  visibleMonth: Date,
  selectedDate: Date,
  today = new Date(),
): CalendarCell[] => {
  const monthStart = getStartOfMonth(visibleMonth);
  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(today);
  const firstDay = monthStart.getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const gridStart = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    1 - mondayOffset,
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );
    const key = toDateKey(date);

    return {
      key,
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: key === todayKey,
      isSelected: key === selectedKey,
    };
  });
};

export const formatMonthTitle = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);

export const formatSelectedTitle = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);

export const formatTimelineHour = (hour: number) => {
  if (hour === 0) {
    return "12 AM";
  }

  if (hour < 12) {
    return `${hour} AM`;
  }

  if (hour === 12) {
    return "12 PM";
  }

  return `${hour - 12} PM`;
};

export const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};
