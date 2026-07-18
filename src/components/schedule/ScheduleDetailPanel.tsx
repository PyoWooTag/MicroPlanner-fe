import { Pencil, Trash2, X } from "lucide-react";

import SchedulePanel from "@/components/schedule/SchedulePanel";
import type { CalendarEvent } from "@/types/calendar";

type ScheduleDetailPanelProps = {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

function ScheduleDetailPanel({
  event,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: ScheduleDetailPanelProps) {
  return (
    <SchedulePanel
      title="일정 상세"
      titleId="schedule-detail-title"
      className="schedule-detail-panel"
      isOpen={isOpen}
      actionsLabel="일정 작업"
      actions={
        <>
          <button
            className="icon-button ghost-icon-button"
            type="button"
            onClick={onEdit}
            disabled={!event}
            aria-label="일정 수정"
            title="일정 수정"
          >
            <Pencil size={22} />
          </button>
          <button
            className="icon-button ghost-icon-button"
            type="button"
            onClick={onDelete}
            disabled={!event}
            aria-label="일정 삭제"
            title="일정 삭제"
          >
            <Trash2 size={22} />
          </button>
          <button
            className="icon-button ghost-icon-button"
            type="button"
            onClick={onClose}
            aria-label="일정 상세 닫기"
            title="일정 상세 닫기"
          >
            <X size={26} />
          </button>
        </>
      }
    >
      {event ? (
        <div className="schedule-detail-content">
          <h3>{event.title}</h3>
          <dl className="schedule-detail-list">
            <div>
              <dt>날짜</dt>
              <dd>{event.date}</dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>
                {event.start} - {event.end}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </SchedulePanel>
  );
}

export default ScheduleDetailPanel;
