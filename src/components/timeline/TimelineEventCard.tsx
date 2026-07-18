import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  getTimelineItemStyle,
  type DraftResizeEdge,
  type PositionedTimelineItem,
} from "@/utils/timeline";

type TimelineEventCardProps = {
  isTimelineTimeSelectionMode: boolean;
  item: PositionedTimelineItem;
  onDraftMoveStart: (
    event: ReactPointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>,
  ) => void;
  onDraftResizeStart: (
    edge: DraftResizeEdge,
    event: ReactPointerEvent<HTMLButtonElement> | ReactMouseEvent<HTMLButtonElement>,
  ) => void;
  onTimelineEventClick: (item: PositionedTimelineItem) => void;
};

function TimelineEventCard({
  isTimelineTimeSelectionMode,
  item,
  onDraftMoveStart,
  onDraftResizeStart,
  onTimelineEventClick,
}: TimelineEventCardProps) {
  const scheduleButtonLabel = isTimelineTimeSelectionMode
    ? `${item.title} 시간에 일정 추가`
    : `${item.title} 일정 상세`;
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
        style={getTimelineItemStyle(item)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={onDraftMoveStart}
        onMouseDown={onDraftMoveStart}
      >
        <button
          className="draft-resize-handle draft-resize-handle-start"
          type="button"
          onPointerDown={(event) => onDraftResizeStart("start", event)}
          onMouseDown={(event) => onDraftResizeStart("start", event)}
          aria-label="시작 시간 조절"
          title="시작 시간 조절"
        />
        {eventContent}
        <button
          className="draft-resize-handle draft-resize-handle-end"
          type="button"
          onPointerDown={(event) => onDraftResizeStart("end", event)}
          onMouseDown={(event) => onDraftResizeStart("end", event)}
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
      style={getTimelineItemStyle(item)}
      onClick={(event) => {
        event.stopPropagation();
        onTimelineEventClick(item);
      }}
      aria-label={scheduleButtonLabel}
      title={scheduleButtonLabel}
    >
      {eventContent}
    </button>
  );
}

export default TimelineEventCard;
