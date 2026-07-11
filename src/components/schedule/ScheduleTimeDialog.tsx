import { X } from "lucide-react";

import type { ScheduleField } from "@/utils/scheduleDateTime";

type ScheduleTimeDialogProps = {
  activeField: ScheduleField;
  draftDate: string;
  draftTime: string;
  isDraftTimeValid: boolean;
  onApply: () => void;
  onClose: () => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

function ScheduleTimeDialog({
  activeField,
  draftDate,
  draftTime,
  isDraftTimeValid,
  onApply,
  onClose,
  onDateChange,
  onTimeChange,
}: ScheduleTimeDialogProps) {
  const isStartField = activeField === "startAt";

  return (
    <div className="time-dialog-backdrop" role="presentation">
      <div
        className="time-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-dialog-title"
      >
        <div className="time-dialog-header">
          <h3 id="time-dialog-title">
            {isStartField ? "시작 시간" : "종료 시간"}
          </h3>
          <button
            className="icon-button ghost-icon-button"
            type="button"
            onClick={onClose}
            aria-label="시간 선택 닫기"
            title="시간 선택 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <label className="form-field">
          <span>날짜</span>
          <input
            type="date"
            value={draftDate}
            onChange={(event) => onDateChange(event.target.value)}
            onInput={(event) => onDateChange(event.currentTarget.value)}
          />
        </label>

        <label className="form-field">
          <span>시간</span>
          <input
            type="time"
            value={draftTime}
            onChange={(event) => onTimeChange(event.target.value)}
            onInput={(event) => onTimeChange(event.currentTarget.value)}
          />
        </label>

        {!isDraftTimeValid ? (
          <p className="form-message" role="alert">
            {isStartField
              ? "시작 시간은 종료 시간보다 이전이어야 합니다."
              : "종료 시간은 시작 시간보다 이후여야 합니다."}
          </p>
        ) : null}

        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            취소
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={onApply}
            disabled={!isDraftTimeValid}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleTimeDialog;
