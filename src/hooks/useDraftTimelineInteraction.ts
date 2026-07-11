import { useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import type { ScheduleDraft } from "@/types/calendar";
import { timeToMinutes } from "@/utils/calendar";
import { getTimeFromLocalDateTime } from "@/utils/scheduleDateTime";
import {
  clamp,
  maxSameDayEndMinutes,
  minDraftDurationMinutes,
  minuteHeight,
  snapToTimelineStep,
  timelineStart,
  toTimelineLocalDateTime,
} from "@/utils/timeline";
import type { DraftResizeEdge } from "@/utils/timeline";

type DraftTimelineInteractionOptions = {
  scheduleDraft: ScheduleDraft | null;
  onDraftChange: (draft: ScheduleDraft) => void;
};

type DraftMoveEvent =
  | ReactPointerEvent<HTMLElement>
  | ReactMouseEvent<HTMLElement>;

type DraftResizeEvent =
  | ReactPointerEvent<HTMLButtonElement>
  | ReactMouseEvent<HTMLButtonElement>;

export const useDraftTimelineInteraction = ({
  scheduleDraft,
  onDraftChange,
}: DraftTimelineInteractionOptions) => {
  const interactionActiveRef = useRef(false);

  const handleDraftResizeStart = (
    edge: DraftResizeEdge,
    event: DraftResizeEvent,
  ) => {
    if (!scheduleDraft?.startAt || !scheduleDraft.endAt) {
      return;
    }

    if (interactionActiveRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    interactionActiveRef.current = true;

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
      const deltaMinutes = snapToTimelineStep(
        (moveEvent.clientY - pointerStartY) / minuteHeight,
      );
      const nextStartMinutes =
        edge === "start"
          ? clamp(
              snapToTimelineStep(initialStartMinutes + deltaMinutes),
              timelineStart,
              initialEndMinutes - minDraftDurationMinutes,
            )
          : initialStartMinutes;
      const nextEndMinutes =
        edge === "end"
          ? clamp(
              snapToTimelineStep(initialEndMinutes + deltaMinutes),
              initialStartMinutes + minDraftDurationMinutes,
              maxSameDayEndMinutes,
            )
          : initialEndMinutes;

      onDraftChange({
        ...scheduleDraft,
        startAt: toTimelineLocalDateTime(dateKey, nextStartMinutes),
        endAt: toTimelineLocalDateTime(dateKey, nextEndMinutes),
      });
    };

    const handleResizeEnd = () => {
      interactionActiveRef.current = false;
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

  const handleDraftMoveStart = (event: DraftMoveEvent) => {
    if (!scheduleDraft?.startAt || !scheduleDraft.endAt) {
      return;
    }

    if (interactionActiveRef.current) {
      return;
    }

    event.preventDefault();
    interactionActiveRef.current = true;

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
      const deltaMinutes = snapToTimelineStep(
        (moveEvent.clientY - pointerStartY) / minuteHeight,
      );
      const nextStartMinutes = clamp(
        snapToTimelineStep(initialStartMinutes + deltaMinutes),
        timelineStart,
        maxStartMinutes,
      );
      const nextEndMinutes = nextStartMinutes + durationMinutes;

      onDraftChange({
        ...scheduleDraft,
        startAt: toTimelineLocalDateTime(dateKey, nextStartMinutes),
        endAt: toTimelineLocalDateTime(dateKey, nextEndMinutes),
      });
    };

    const handleMoveEnd = () => {
      interactionActiveRef.current = false;
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

  return {
    handleDraftMoveStart,
    handleDraftResizeStart,
  };
};
