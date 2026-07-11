import type { CSSProperties } from "react";

import type { CalendarEvent, ScheduleDraft } from "@/types/calendar";
import {
  getDurationMinutes,
  getTimeFromLocalDateTime,
} from "@/utils/scheduleDateTime";
import { timeToMinutes } from "@/utils/calendar";

export const timeSlots = Array.from({ length: 24 }, (_, index) => index);
export const timelineStart = 0;
export const timelineEnd = 24 * 60;
export const minuteHeight = 0.95;
export const focusOffset = 140;
export const laneGap = 4;
export const minimumEventHeight = 30;
export const resizeStepMinutes = 10;
export const minDraftDurationMinutes = 10;
export const maxSameDayEndMinutes = timelineEnd - resizeStepMinutes;

export type DraftResizeEdge = "start" | "end";

export type TimelineItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  className: string;
};

export type PositionedTimelineItem = TimelineItem & {
  lane: number;
  laneCount: number;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const snapToTimelineStep = (value: number) =>
  Math.round(value / resizeStepMinutes) * resizeStepMinutes;

export const minutesToTimelineTime = (minutes: number) => {
  const safeMinutes = clamp(minutes, timelineStart, maxSameDayEndMinutes);
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const toTimelineLocalDateTime = (dateKey: string, minutes: number) =>
  `${dateKey}T${minutesToTimelineTime(minutes)}`;

const getEventTone = (type: CalendarEvent["type"]) => {
  if (type === "deep") {
    return "event-card event-card-deep";
  }

  if (type === "routine") {
    return "event-card event-card-routine";
  }

  return "event-card event-card-light";
};

export const toTimelineItem = (event: CalendarEvent): TimelineItem => {
  const startMinutes = timeToMinutes(event.start);
  const rawEndMinutes = timeToMinutes(event.end);
  const durationMinutes = Math.max(1, rawEndMinutes - startMinutes);

  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
    durationMinutes,
    className: getEventTone(event.type),
  };
};

export const toDraftTimelineItem = (
  scheduleDraft: ScheduleDraft | null,
  selectedDateKey: string,
  fallbackTitle: string,
): TimelineItem | null => {
  if (
    !scheduleDraft?.startAt ||
    !scheduleDraft.endAt ||
    scheduleDraft.startAt.slice(0, 10) !== selectedDateKey ||
    scheduleDraft.startAt >= scheduleDraft.endAt
  ) {
    return null;
  }

  const start = getTimeFromLocalDateTime(scheduleDraft.startAt);
  const end = getTimeFromLocalDateTime(scheduleDraft.endAt);
  const startMinutes = timeToMinutes(start);
  const durationMinutes = getDurationMinutes(
    scheduleDraft.startAt,
    scheduleDraft.endAt,
  );

  return {
    id: "draft-preview",
    title: scheduleDraft.title.trim() || fallbackTitle,
    start,
    end,
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
    durationMinutes,
    className: "event-card event-card-preview",
  };
};

const layoutCluster = (cluster: TimelineItem[]): PositionedTimelineItem[] => {
  const laneEnds: number[] = [];
  const positioned = cluster
    .sort((left, right) => left.startMinutes - right.startMinutes)
    .map((item) => {
      const availableLane = laneEnds.findIndex((end) => end <= item.startMinutes);
      const lane = availableLane === -1 ? laneEnds.length : availableLane;

      laneEnds[lane] = item.endMinutes;

      return {
        ...item,
        lane,
        laneCount: 1,
      };
    });
  const laneCount = laneEnds.length;

  return positioned.map((item) => ({
    ...item,
    laneCount,
  }));
};

export const layoutTimelineItems = (items: TimelineItem[]) => {
  const sortedItems = [...items].sort(
    (left, right) => left.startMinutes - right.startMinutes,
  );
  const clusters: TimelineItem[][] = [];
  let currentCluster: TimelineItem[] = [];
  let currentClusterEnd = 0;

  sortedItems.forEach((item) => {
    if (currentCluster.length === 0 || item.startMinutes < currentClusterEnd) {
      currentCluster.push(item);
      currentClusterEnd = Math.max(currentClusterEnd, item.endMinutes);
      return;
    }

    clusters.push(currentCluster);
    currentCluster = [item];
    currentClusterEnd = item.endMinutes;
  });

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters.flatMap(layoutCluster);
};

export const getTimelineItemStyle = (
  item: PositionedTimelineItem,
): CSSProperties => {
  const width = 100 / item.laneCount;
  const leftPercent = width * item.lane;
  const rightPercent = 100 - width * (item.lane + 1);

  return {
    top: Math.max(0, item.startMinutes - timelineStart) * minuteHeight,
    height: Math.max(minimumEventHeight, item.durationMinutes * minuteHeight),
    left: item.lane === 0 ? 0 : `calc(${leftPercent}% + ${laneGap}px)`,
    right:
      item.lane === item.laneCount - 1
        ? 0
        : `calc(${rightPercent}% + ${laneGap}px)`,
  };
};
