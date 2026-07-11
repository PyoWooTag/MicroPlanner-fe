import { Clock, X } from "lucide-react";
import type { FormEvent } from "react";

import ScheduleTimeDialog from "@/components/schedule/ScheduleTimeDialog";
import {
  formatLocalDateTime,
  type ScheduleField,
  type ScheduleFormValues,
} from "@/utils/scheduleDateTime";

type ScheduleFormPanelProps = {
  activeField: ScheduleField | null;
  draftDate: string;
  draftTime: string;
  formValues: ScheduleFormValues;
  isDraftTimeValid: boolean;
  isEditing: boolean;
  isFormValid: boolean;
  isOpen: boolean;
  isTimeSelected: boolean;
  isTimeValid: boolean;
  onApplyTime: () => void;
  onClose: () => void;
  onCloseTimeDialog: () => void;
  onDateChange: (value: string) => void;
  onOpenTimeDialog: (field: ScheduleField) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTimeChange: (value: string) => void;
  onTitleChange: (value: string) => void;
};

function ScheduleFormPanel({
  activeField,
  draftDate,
  draftTime,
  formValues,
  isDraftTimeValid,
  isEditing,
  isFormValid,
  isOpen,
  isTimeSelected,
  isTimeValid,
  onApplyTime,
  onClose,
  onCloseTimeDialog,
  onDateChange,
  onOpenTimeDialog,
  onSubmit,
  onTimeChange,
  onTitleChange,
}: ScheduleFormPanelProps) {
  return (
    <section
      className="add-schedule-panel"
      aria-hidden={!isOpen}
      aria-labelledby="add-schedule-title"
    >
      <div className="add-schedule-header">
        <h2 id="add-schedule-title" className="visually-hidden">
          일정 추가
        </h2>
        <button
          className="icon-button ghost-icon-button"
          type="button"
          onClick={onClose}
          aria-label="일정 추가 닫기"
          title="일정 추가 닫기"
        >
          <X size={26} />
        </button>
      </div>

      <form className="schedule-form" onSubmit={onSubmit}>
        <label className="form-field">
          <input
            type="text"
            value={formValues.title}
            onChange={(event) => onTitleChange(event.target.value)}
            onInput={(event) => onTitleChange(event.currentTarget.value)}
            placeholder="일정 제목"
          />
        </label>

        <section className="time-form-section" aria-label="일정 시간">
          <Clock className="time-section-icon" size={28} aria-hidden="true" />
          <div className="time-fields">
            <button
              className="time-select-button"
              type="button"
              aria-invalid={!isTimeValid}
              aria-label="일정 시작 시간"
              onClick={() => onOpenTimeDialog("startAt")}
            >
              {formatLocalDateTime(formValues.startAt)}
            </button>
            <button
              className="time-select-button"
              type="button"
              aria-invalid={!isTimeValid}
              aria-label="일정 종료 시간"
              onClick={() => onOpenTimeDialog("endAt")}
            >
              {formatLocalDateTime(formValues.endAt)}
            </button>
            {isTimeSelected && !isTimeValid ? (
              <p className="form-message" role="alert">
                종료 시간은 시작 시간보다 뒤여야 합니다.
              </p>
            ) : null}
          </div>
        </section>

        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="submit" disabled={!isFormValid}>
            {isEditing ? "저장" : "추가"}
          </button>
        </div>
      </form>

      {activeField ? (
        <ScheduleTimeDialog
          activeField={activeField}
          draftDate={draftDate}
          draftTime={draftTime}
          isDraftTimeValid={isDraftTimeValid}
          onApply={onApplyTime}
          onClose={onCloseTimeDialog}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
        />
      ) : null}
    </section>
  );
}

export default ScheduleFormPanel;
