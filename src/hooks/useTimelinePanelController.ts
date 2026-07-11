import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { useDraftTimelineInteraction } from "@/hooks/useDraftTimelineInteraction";
import { useCalendarStore } from "@/store/calendarStore";
import type { ScheduleDraft } from "@/types/calendar";
import { formatSelectedTitle, timeToMinutes, toDateKey } from "@/utils/calendar";
import { getEventsByDate } from "@/utils/calendarEvents";
import {
  getDateFromLocalDateTime,
  getMinutesFromDate,
  getTimeFromLocalDateTime,
} from "@/utils/scheduleDateTime";
import {
  focusOffset,
  layoutTimelineItems,
  minuteHeight,
  timelineEnd,
  timelineStart,
  toDraftTimelineItem,
  toTimelineItem,
} from "@/utils/timeline";

type UseTimelinePanelControllerOptions = {
  editingEventId: string | null;
  onAddSchedule: (draft?: ScheduleDraft | null) => void;
  scheduleDraft: ScheduleDraft | null;
  onDraftChange: (draft: ScheduleDraft) => void;
};

export const useTimelinePanelController = ({
  editingEventId,
  onAddSchedule,
  scheduleDraft,
  onDraftChange,
}: UseTimelinePanelControllerOptions) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => new Date());
  const { events, selectedDate } = useCalendarStore();
  const { handleDraftMoveStart, handleDraftResizeStart } =
    useDraftTimelineInteraction({
      scheduleDraft,
      onDraftChange,
    });

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
  const selectedDateKey = toDateKey(displayDate);
  const nowDateKey = toDateKey(now);
  const currentMinutes = getMinutesFromDate(now);
  const shouldShowCurrentTime =
    selectedDateKey === nowDateKey &&
    currentMinutes >= timelineStart &&
    currentMinutes <= timelineEnd;
  const draftItem = useMemo(
    () => toDraftTimelineItem(scheduleDraft, selectedDateKey, "새 일정"),
    [scheduleDraft, selectedDateKey],
  );
  const items = useMemo(
    () =>
      layoutTimelineItems([
        ...selectedEvents.map(toTimelineItem),
        ...(draftItem ? [draftItem] : []),
      ]),
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

    const startMinutes = timeToMinutes(
      getTimeFromLocalDateTime(scheduleDraft.startAt),
    );
    const top = Math.max(
      0,
      (startMinutes - timelineStart) * minuteHeight - focusOffset,
    );

    scrollRef.current?.scrollTo({
      top,
      behavior: "smooth",
    });
  }, [scheduleDraft]);

  const handleTimelineSlotClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const trackTop = event.currentTarget.getBoundingClientRect().top;
    const clickedMinutes = Math.max(
      timelineStart,
      Math.min(timelineEnd - 1, (event.clientY - trackTop) / minuteHeight),
    );
    const startHour = Math.floor(clickedMinutes / 60);
    const endHour = startHour + 1;
    const startTime = `${String(startHour).padStart(2, "0")}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    onAddSchedule({
      title: "",
      startAt: `${selectedDateKey}T${startTime}`,
      endAt: `${selectedDateKey}T${endTime}`,
    });
  };

  return {
    currentTimeTop: (currentMinutes - timelineStart) * minuteHeight,
    items,
    onDraftMoveStart: handleDraftMoveStart,
    onDraftResizeStart: handleDraftResizeStart,
    onTimelineSlotClick: handleTimelineSlotClick,
    scrollRef,
    selectedTitle: formatSelectedTitle(displayDate),
    shouldShowCurrentTime,
  };
};
