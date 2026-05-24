import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";

import { getEventsByDate, useCalendarStore } from "@/store/calendarStore";
import type { CalendarEvent, ScheduleDraft } from "@/types/calendar";
import {
  formatSelectedTitle,
  formatTimelineHour,
  timeToMinutes,
  toDateKey,
} from "@/utils/calendar";

const timeSlots = Array.from({ length: 24 }, (_, index) => index);
const timelineStart = 0;
const timelineEnd = 24 * 60;
const minuteHeight = 0.95;
const focusOffset = 140;
const laneGap = 4;

type TimelineItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  className: string;
};

type PositionedTimelineItem = TimelineItem & {
  lane: number;
  laneCount: number;
};

const getDateFromLocalDateTime = (value: string) => {
  const [date] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const getTimeFromLocalDateTime = (value: string) => value.slice(11, 16);

const getDurationMinutes = (startAt: string, endAt: string) =>
  Math.max(0, (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);

const getEventTone = (type: CalendarEvent["type"]) => {
  if (type === "deep") {
    return "event-card event-card-deep";
  }

  if (type === "routine") {
    return "event-card event-card-routine";
  }

  return "event-card event-card-light";
};

const toTimelineItem = (event: CalendarEvent): TimelineItem => {
  const startMinutes = timeToMinutes(event.start);
  const rawEndMinutes = timeToMinutes(event.end);
  const durationMinutes = Math.max(30, rawEndMinutes - startMinutes);

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

const layoutTimelineItems = (items: TimelineItem[]) => {
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

const getItemStyle = (item: PositionedTimelineItem): CSSProperties => {
  const width = 100 / item.laneCount;
  const leftPercent = width * item.lane;
  const rightPercent = 100 - width * (item.lane + 1);

  return {
    top: Math.max(0, item.startMinutes - timelineStart) * minuteHeight,
    height: Math.max(52, item.durationMinutes) * minuteHeight,
    left: item.lane === 0 ? 0 : `calc(${leftPercent}% + ${laneGap}px)`,
    right: item.lane === item.laneCount - 1 ? 0 : `calc(${rightPercent}% + ${laneGap}px)`,
  };
};

type TimelinePageProps = {
  scheduleDraft: ScheduleDraft | null;
  onAddSchedule: () => void;
};

function TimelinePage({ onAddSchedule, scheduleDraft }: TimelinePageProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { events, selectedDate } = useCalendarStore();
  const displayDate = useMemo(
    () =>
      scheduleDraft?.startAt
        ? getDateFromLocalDateTime(scheduleDraft.startAt)
        : selectedDate,
    [scheduleDraft, selectedDate],
  );
  const selectedEvents = useMemo(
    () => getEventsByDate(events, displayDate),
    [displayDate, events],
  );
  const selectedTitle = formatSelectedTitle(displayDate);
  const selectedDateKey = toDateKey(displayDate);
  const draftItem =
    scheduleDraft &&
    scheduleDraft.startAt &&
    scheduleDraft.endAt &&
    scheduleDraft.startAt.slice(0, 10) === selectedDateKey &&
    scheduleDraft.startAt < scheduleDraft.endAt
      ? {
          id: "draft-preview",
          title: scheduleDraft.title.trim() || "새 일정",
          start: getTimeFromLocalDateTime(scheduleDraft.startAt),
          end: getTimeFromLocalDateTime(scheduleDraft.endAt),
          startMinutes: timeToMinutes(getTimeFromLocalDateTime(scheduleDraft.startAt)),
          endMinutes:
            timeToMinutes(getTimeFromLocalDateTime(scheduleDraft.startAt)) +
            getDurationMinutes(scheduleDraft.startAt, scheduleDraft.endAt),
          durationMinutes: getDurationMinutes(scheduleDraft.startAt, scheduleDraft.endAt),
          className: "event-card event-card-preview",
        }
      : null;
  const timelineItems = useMemo(
    () => layoutTimelineItems([...selectedEvents.map(toTimelineItem), ...(draftItem ? [draftItem] : [])]),
    [draftItem, selectedEvents],
  );

  useEffect(() => {
    if (!scheduleDraft?.startAt) {
      return;
    }

    const startMinutes = timeToMinutes(getTimeFromLocalDateTime(scheduleDraft.startAt));
    const top = Math.max(0, (startMinutes - timelineStart) * minuteHeight - focusOffset);

    scrollRef.current?.scrollTo({
      top,
      behavior: "smooth",
    });
  }, [scheduleDraft]);

  return (
    <aside className="timeline-panel" aria-labelledby="timeline-title">
      <div className="timeline-header">
        <div>
          <h2 id="timeline-title">{selectedTitle}</h2>
        </div>
      </div>

      <div className="timeline-scroll" ref={scrollRef}>
        <div
          className="timeline-track"
          style={{ minHeight: (timelineEnd - timelineStart) * minuteHeight }}
        >
          {timeSlots.map((hour) => (
            <div
              className="time-slot"
              key={hour}
              style={{ height: 60 * minuteHeight }}
            >
              <span>{formatTimelineHour(hour)}</span>
            </div>
          ))}

          <div className="timeline-events-layer">
            {timelineItems.map((item) => (
              <article
                className={item.className}
                key={item.id}
                style={getItemStyle(item)}
              >
                <h3>{item.title}</h3>
                <p>
                  {item.start} - {item.end}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="floating-actions" aria-label="빠른 작업">
        <button
          className="floating-button floating-button-primary"
          type="button"
          onClick={onAddSchedule}
          aria-label="일정 추가"
          title="일정 추가"
        >
          <Plus size={22} />
        </button>
      </div>
    </aside>
  );
}

export default TimelinePage;
