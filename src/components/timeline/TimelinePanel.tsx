import { Plus } from "lucide-react";
import type {
  MouseEventHandler,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

import TimelineEventCard from "@/components/timeline/TimelineEventCard";
import { formatTimelineHour } from "@/utils/calendar";
import {
  minuteHeight,
  timeSlots,
  timelineEnd,
  timelineStart,
  type DraftResizeEdge,
  type PositionedTimelineItem,
} from "@/utils/timeline";

type TimelinePanelProps = {
  currentTimeTop: number;
  items: PositionedTimelineItem[];
  onAddSchedule: () => void;
  onDraftMoveStart: (
    event: ReactPointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>,
  ) => void;
  onDraftResizeStart: (
    edge: DraftResizeEdge,
    event: ReactPointerEvent<HTMLButtonElement> | ReactMouseEvent<HTMLButtonElement>,
  ) => void;
  onEditSchedule: (eventId: string) => void;
  onTimelineSlotClick: MouseEventHandler<HTMLDivElement>;
  scrollRef: RefObject<HTMLDivElement | null>;
  selectedTitle: string;
  shouldShowCurrentTime: boolean;
};

function TimelinePanel({
  currentTimeTop,
  items,
  onAddSchedule,
  onDraftMoveStart,
  onDraftResizeStart,
  onEditSchedule,
  onTimelineSlotClick,
  scrollRef,
  selectedTitle,
  shouldShowCurrentTime,
}: TimelinePanelProps) {
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
          onClick={onTimelineSlotClick}
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
            {items.map((item) => (
              <TimelineEventCard
                item={item}
                key={item.id}
                onDraftMoveStart={onDraftMoveStart}
                onDraftResizeStart={onDraftResizeStart}
                onEditSchedule={onEditSchedule}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="floating-actions" aria-label="빠른 작업">
        <button
          className="floating-button floating-button-primary"
          type="button"
          onClick={() => onAddSchedule()}
          aria-label="일정 추가"
          title="일정 추가"
        >
          <Plus size={22} />
        </button>
      </div>
    </aside>
  );
}

export default TimelinePanel;
