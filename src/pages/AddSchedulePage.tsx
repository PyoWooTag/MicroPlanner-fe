import { Clock, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useCalendarStore } from "@/store/calendarStore";
import type { ScheduleDraft } from "@/types/calendar";
import { toDateKey } from "@/utils/calendar";

type ScheduleField = "startAt" | "endAt";

type ScheduleFormValues = {
  title: string;
  startAt: string;
  endAt: string;
};

type AddSchedulePageProps = {
  isOpen: boolean;
  onDraftChange: (draft: ScheduleDraft | null) => void;
  onClose: () => void;
};

const hasTimeRange = (startAt: string, endAt: string) =>
  startAt.length > 0 && endAt.length > 0;

const isTimeRangeValid = (startAt: string, endAt: string) =>
  hasTimeRange(startAt, endAt) && startAt < endAt;

const toDate = (localDateTime: string) => new Date(localDateTime);

const getTimeFromLocalDateTime = (localDateTime: string) =>
  localDateTime.slice(11, 16);

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}`;
};

const shiftEndAtByStartChange = (
  previousStartAt: string,
  previousEndAt: string,
  nextStartAt: string,
) => {
  const duration = toDate(previousEndAt).getTime() - toDate(previousStartAt).getTime();
  const safeDuration = duration > 0 ? duration : 60 * 60 * 1000;
  const nextEndAt = new Date(toDate(nextStartAt).getTime() + safeDuration);

  return `${toDateKey(nextEndAt)}T${String(nextEndAt.getHours()).padStart(
    2,
    "0",
  )}:${String(nextEndAt.getMinutes()).padStart(2, "0")}`;
};

const formatLocalDateTime = (value: string) => {
  if (!value) {
    return "시간 선택";
  }

  const [date = "", time = ""] = value.split("T");
  const [year, month, day] = date.split("-");

  if (!year || !month || !day || !time) {
    return "시간 선택";
  }

  return `${Number(month)}월 ${Number(day)}일 ${time}`;
};

function AddSchedulePage({
  isOpen,
  onClose,
  onDraftChange,
}: AddSchedulePageProps) {
  const { addEvent, selectDate, selectedDate } = useCalendarStore();
  const initialValues = useMemo(
    () => ({
      title: "",
      startAt: "",
      endAt: "",
    }),
    [selectedDate],
  );
  const [formValues, setFormValues] = useState<ScheduleFormValues>(initialValues);
  const [activeField, setActiveField] = useState<ScheduleField | null>(null);
  const [draftDate, setDraftDate] = useState(toDateKey(selectedDate));
  const [draftTime, setDraftTime] = useState("09:00");

  useEffect(() => {
    if (!isOpen) {
      onDraftChange(null);
      return;
    }

    setFormValues(initialValues);
    setActiveField(null);
    setDraftDate(toDateKey(selectedDate));
    setDraftTime("");
  }, [initialValues, isOpen, onDraftChange, selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    onDraftChange(formValues);
  }, [formValues, isOpen, onDraftChange]);

  const isTimeValid = isTimeRangeValid(formValues.startAt, formValues.endAt);
  const isTimeSelected = hasTimeRange(formValues.startAt, formValues.endAt);
  const isFormValid = formValues.title.trim().length > 0 && isTimeValid;
  const projectedValues = activeField
    ? activeField === "startAt"
      ? {
          ...formValues,
          startAt: `${draftDate}T${draftTime}`,
          endAt: shiftEndAtByStartChange(
            formValues.startAt,
            formValues.endAt,
            `${draftDate}T${draftTime}`,
          ),
        }
      : {
          ...formValues,
          endAt: `${draftDate}T${draftTime}`,
        }
    : formValues;
  const isDraftTimeValid =
    activeField === "startAt"
      ? true
      : isTimeRangeValid(projectedValues.startAt, projectedValues.endAt);

  const openTimeDialog = (field: ScheduleField) => {
    const fallbackTime = field === "startAt" ? "09:00" : "10:00";
    const [date, time] = formValues[field].split("T");

    setActiveField(field);
    setDraftDate(date || toDateKey(selectedDate));
    setDraftTime(time || fallbackTime);
  };

  const closeTimeDialog = () => {
    setActiveField(null);
  };

  const applyTime = () => {
    if (!activeField || !isDraftTimeValid) {
      return;
    }

    setFormValues((current) => {
      const nextValue = `${draftDate}T${draftTime}`;

      if (activeField === "startAt") {
        return {
          ...current,
          startAt: nextValue,
          endAt: shiftEndAtByStartChange(current.startAt, current.endAt, nextValue),
        };
      }

      return {
        ...current,
        endAt: nextValue,
      };
    });
    closeTimeDialog();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    const startDate = toDate(formValues.startAt);

    addEvent({
      id: createEventId(),
      title: formValues.title.trim(),
      date: toDateKey(startDate),
      start: getTimeFromLocalDateTime(formValues.startAt),
      end: getTimeFromLocalDateTime(formValues.endAt),
      type: "light",
    });
    selectDate(startDate);
    onClose();
  };

  const updateTitle = (value: string) => {
    setFormValues((current) => ({
      ...current,
      title: value,
    }));
  };

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

      <form className="schedule-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <input
            type="text"
            value={formValues.title}
            onChange={(event) => updateTitle(event.target.value)}
            onInput={(event) => updateTitle(event.currentTarget.value)}
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
              onClick={() => openTimeDialog("startAt")}
            >
              {formatLocalDateTime(formValues.startAt)}
            </button>
            <button
              className="time-select-button"
              type="button"
              aria-invalid={!isTimeValid}
              aria-label="일정 종료 시간"
              onClick={() => openTimeDialog("endAt")}
            >
              {formatLocalDateTime(formValues.endAt)}
            </button>
            {isTimeSelected && !isTimeValid ? (
              <p className="form-message" role="alert">
                종료 시간은 시작 시간보다 늦어야 합니다.
              </p>
            ) : null}
          </div>
        </section>

        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="submit" disabled={!isFormValid}>
            추가
          </button>
        </div>
      </form>

      {activeField ? (
        <div className="time-dialog-backdrop" role="presentation">
          <div
            className="time-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="time-dialog-title"
          >
            <div className="time-dialog-header">
              <h3 id="time-dialog-title">
                {activeField === "startAt" ? "시작 시간" : "종료 시간"}
              </h3>
              <button
                className="icon-button ghost-icon-button"
                type="button"
                onClick={closeTimeDialog}
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
                onChange={(event) => setDraftDate(event.target.value)}
                onInput={(event) => setDraftDate(event.currentTarget.value)}
              />
            </label>

            <label className="form-field">
              <span>시간</span>
              <input
                type="time"
                value={draftTime}
                onChange={(event) => setDraftTime(event.target.value)}
                onInput={(event) => setDraftTime(event.currentTarget.value)}
              />
            </label>

            {!isDraftTimeValid ? (
              <p className="form-message" role="alert">
                {activeField === "startAt"
                  ? "시작 시간은 종료 시간보다 이전이어야 합니다."
                  : "종료 시간은 시작 시간보다 이후여야 합니다."}
              </p>
            ) : null}

            <div className="form-actions">
              <button className="text-button" type="button" onClick={closeTimeDialog}>
                취소
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={applyTime}
                disabled={!isDraftTimeValid}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AddSchedulePage;
