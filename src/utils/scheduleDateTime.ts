import type { CalendarEvent, ScheduleDraft } from "@/types/calendar";
import { toDateKey } from "@/utils/calendar";

export type ScheduleFormValues = {
  title: string;
  startAt: string;
  endAt: string;
};

export type ScheduleField = "startAt" | "endAt";

export const hasTimeRange = (startAt: string, endAt: string) =>
  startAt.length > 0 && endAt.length > 0;

export const isTimeRangeValid = (startAt: string, endAt: string) =>
  hasTimeRange(startAt, endAt) && startAt < endAt;

export const toDate = (localDateTime: string) => new Date(localDateTime);

export const getDateFromLocalDateTime = (value: string) => {
  const [date] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
};

export const getTimeFromLocalDateTime = (localDateTime: string) =>
  localDateTime.slice(11, 16);

export const toLocalDateTime = (date: string, time: string) => `${date}T${time}`;

export const toScheduleDraft = (event: CalendarEvent): ScheduleDraft => ({
  title: event.title,
  startAt: toLocalDateTime(event.date, event.start),
  endAt: toLocalDateTime(event.date, event.end),
});

export const formatLocalDateTime = (value: string) => {
  if (!value) {
    return "시간 선택";
  }

  const [date = "", time = ""] = value.split("T");
  const [year, month, day] = date.split("-");

  if (!year || !month || !day || !time) {
    return "시간 선택";
  }

  return `${Number(month)}월 ${Number(day)}일 ${time}`;
};

export const getDurationMinutes = (startAt: string, endAt: string) =>
  Math.max(0, (toDate(endAt).getTime() - toDate(startAt).getTime()) / 60000);

export const getMinutesFromDate = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

export const areDraftsEqual = (
  left: ScheduleFormValues,
  right: ScheduleDraft,
) =>
  left.title === right.title &&
  left.startAt === right.startAt &&
  left.endAt === right.endAt;

export const hasDraftContent = (draft: ScheduleDraft) =>
  draft.title.length > 0 || draft.startAt.length > 0 || draft.endAt.length > 0;

export const shiftEndAtByStartChange = (
  previousStartAt: string,
  previousEndAt: string,
  nextStartAt: string,
) => {
  const duration = toDate(previousEndAt).getTime() - toDate(previousStartAt).getTime();
  const safeDuration = duration > 0 ? duration : 60 * 60 * 1000;
  const nextEndAt = new Date(toDate(nextStartAt).getTime() + safeDuration);

  return `${toDateKey(nextEndAt)}T${String(nextEndAt.getHours()).padStart(
    2,
    "0",
  )}:${String(nextEndAt.getMinutes()).padStart(2, "0")}`;
};
