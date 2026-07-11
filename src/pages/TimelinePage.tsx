import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent,
} from "react";

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
const minimumEventHeight = 30;
const resizeStepMinutes = 10;
const minDraftDurationMinutes = 10;
const maxSameDayEndMinutes = timelineEnd - resizeStepMinutes;

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

const getMinutesFromDate = (date: Date) => date.getHours() * 60 + date.getMinutes();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const snapToStep = (value: number) =>
  Math.round(value / resizeStepMinutes) * resizeStepMinutes;

const minutesToTime = (minutes: number) => {
  const safeMinutes = clamp(minutes, timelineStart, maxSameDayEndMinutes);
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const toLocalDateTime = (dateKey: string, minutes: number) =>
  `${dateKey}T${minutesToTime(minutes)}`;

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
    height: Math.max(minimumEventHeight, item.durationMinutes * minuteHeight),
    left: item.lane === 0 ? 0 : `calc(${leftPercent}% + ${laneGap}px)`,
    right: item.lane === item.laneCount - 1 ? 0 : `calc(${rightPercent}% + ${laneGap}px)`,
  };
};

type TimelinePageProps = {
  editingEventId: string | null;
  scheduleDraft: ScheduleDraft | null;
  onAddSchedule: () => void;
  onDraftChange: (draft: ScheduleDraft) => void;
  onEditSchedule: (eventId: string) => void;
};

function TimelinePage({
  editingEventId,
  onAddSchedule,
  onDraftChange,
  onEditSchedule,
  scheduleDraft,
}: TimelinePageProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const resizeActiveRef = useRef(false);
  const [now, setNow] = useState(() => new Date());
  const { events, selectedDate } = useCalendarStore();
  const displayDate = useMemo(
    () =>
      scheduleDraft?.startAt
        ? getDateFromLocalDateTime(scheduleDraft.startAt)
        : selectedDate,
    [scheduleDraft, selectedDate],
  );
  const selectedEvents = useMemo(
    () =>
      getEventsByDate(events, displayDate).filter(
        (event) => event.id !== editingEventId,
      ),
    [displayDate, editingEventId, events],
  );
  const selectedTitle = formatSelectedTitle(displayDate);
  const selectedDateKey = toDateKey(displayDate);
  const nowDateKey = toDateKey(now);
  const currentMinutes = getMinutesFromDate(now);
  const shouldShowCurrentTime =
    selectedDateKey === nowDateKey &&
    currentMinutes >= timelineStart &&
    currentMinutes <= timelineEnd;
  const currentTimeTop = (currentMinutes - timelineStart) * minuteHeight;
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
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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

  const handleDraftResizeStart = (
    edge: "start" | "end",
    event: PointerEvent<HTMLButtonElement> | ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (!scheduleDraft?.startAt || !scheduleDraft.endAt) {
      return;
    }

    if (resizeActiveRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    resizeActiveRef.current = true;

    const dateKey = scheduleDraft.startAt.slice(0, 10);
    const initialStartMinutes = timeToMinutes(
      getTimeFromLocalDateTime(scheduleDraft.startAt),
    );
    const initialEndMinutes = timeToMinutes(
      getTimeFromLocalDateTime(scheduleDraft.endAt),
    );
    const pointerStartY = event.clientY;

    if ("pointerId" in event) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const handleResizeMove = (
      moveEvent: globalThis.PointerEvent | globalThis.MouseEvent,
    ) => {
      const deltaMinutes = snapToStep(
        (moveEvent.clientY - pointerStartY) / minuteHeight,
      );
      const nextStartMinutes =
        edge === "start"
          ? clamp(
              snapToStep(initialStartMinutes + deltaMinutes),
              timelineStart,
              initialEndMinutes - minDraftDurationMinutes,
            )
          : initialStartMinutes;
      const nextEndMinutes =
        edge === "end"
          ? clamp(
              snapToStep(initialEndMinutes + deltaMinutes),
              initialStartMinutes + minDraftDurationMinutes,
              maxSameDayEndMinutes,
            )
          : initialEndMinutes;

      onDraftChange({
        ...scheduleDraft,
        startAt: toLocalDateTime(dateKey, nextStartMinutes),
        endAt: toLocalDateTime(dateKey, nextEndMinutes),
      });
    };

    const handleResizeEnd = () => {
      resizeActiveRef.current = false;
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeEnd);
      window.removeEventListener("mouseup", handleResizeEnd);
    };

    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeEnd);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleDraftMoveStart = (
    event: PointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>,
  ) => {
    if (!scheduleDraft?.startAt || !scheduleDraft.endAt) {
      return;
    }

    if (resizeActiveRef.current) {
      return;
    }

    event.preventDefault();
    resizeActiveRef.current = true;

    const dateKey = scheduleDraft.startAt.slice(0, 10);
    const initialStartMinutes = timeToMinutes(
      getTimeFromLocalDateTime(scheduleDraft.startAt),
    );
    const initialEndMinutes = timeToMinutes(
      getTimeFromLocalDateTime(scheduleDraft.endAt),
    );
    const durationMinutes = initialEndMinutes - initialStartMinutes;
    const maxStartMinutes = maxSameDayEndMinutes - durationMinutes;
    const pointerStartY = event.clientY;

    if ("pointerId" in event) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const handleMove = (
      moveEvent: globalThis.PointerEvent | globalThis.MouseEvent,
    ) => {
      const deltaMinutes = snapToStep(
        (moveEvent.clientY - pointerStartY) / minuteHeight,
      );
      const nextStartMinutes = clamp(
        snapToStep(initialStartMinutes + deltaMinutes),
        timelineStart,
        maxStartMinutes,
      );
      const nextEndMinutes = nextStartMinutes + durationMinutes;

      onDraftChange({
        ...scheduleDraft,
        startAt: toLocalDateTime(dateKey, nextStartMinutes),
        endAt: toLocalDateTime(dateKey, nextEndMinutes),
      });
    };

    const handleMoveEnd = () => {
      resizeActiveRef.current = false;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerup", handleMoveEnd);
      window.removeEventListener("mouseup", handleMoveEnd);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("pointerup", handleMoveEnd);
    window.addEventListener("mouseup", handleMoveEnd);
  };

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

          {shouldShowCurrentTime && (
            <div
              className="current-time-line"
              style={{ top: currentTimeTop }}
              aria-hidden="true"
            />
          )}

          <div className="timeline-events-layer">
            {timelineItems.map((item) => {
              const eventContent = (
                <>
                  <h3>{item.title}</h3>
                  <p>
                    {item.start} - {item.end}
                  </p>
                </>
              );

              if (item.id === "draft-preview") {
                return (
                  <article
                    className={item.className}
                    key={item.id}
                    style={getItemStyle(item)}
                    onPointerDown={handleDraftMoveStart}
                    onMouseDown={handleDraftMoveStart}
                  >
                    <button
                      className="draft-resize-handle draft-resize-handle-start"
                      type="button"
                      onPointerDown={(event) =>
                        handleDraftResizeStart("start", event)
                      }
                      onMouseDown={(event) =>
                        handleDraftResizeStart("start", event)
                      }
                      aria-label="시작 시간 조절"
                      title="시작 시간 조절"
                    />
                    {eventContent}
                    <button
                      className="draft-resize-handle draft-resize-handle-end"
                      type="button"
                      onPointerDown={(event) =>
                        handleDraftResizeStart("end", event)
                      }
                      onMouseDown={(event) =>
                        handleDraftResizeStart("end", event)
                      }
                      aria-label="종료 시간 조절"
                      title="종료 시간 조절"
                    />
                  </article>
                );
              }

              return (
                <button
                  className={item.className}
                  key={item.id}
                  type="button"
                  style={getItemStyle(item)}
                  onClick={() => onEditSchedule(item.id)}
                  aria-label={`${item.title} 일정 수정`}
                  title={`${item.title} 일정 수정`}
                >
                  {eventContent}
                </button>
              );
            })}
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
