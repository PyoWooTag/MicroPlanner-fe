import { useEffect, useMemo, useRef, useState } from "react";

import type { CalendarEvent, ScheduleDraft } from "@/types/calendar";
import {
  areDraftsEqual,
  hasDraftContent,
  hasTimeRange,
  isTimeRangeValid,
  shiftEndAtByStartChange,
  toScheduleDraft,
  type ScheduleField,
  type ScheduleFormValues,
} from "@/utils/scheduleDateTime";

type UseScheduleEditorOptions = {
  eventToEdit: CalendarEvent | null;
  isOpen: boolean;
  onDraftChange: (draft: ScheduleDraft | null) => void;
  scheduleDraft: ScheduleDraft | null;
  selectedDateKey: string;
};

const emptyScheduleValues = {
  title: "",
  startAt: "",
  endAt: "",
};

export const useScheduleEditor = ({
  eventToEdit,
  isOpen,
  onDraftChange,
  scheduleDraft,
  selectedDateKey,
}: UseScheduleEditorOptions) => {
  const initialValues = useMemo(
    () => (eventToEdit ? toScheduleDraft(eventToEdit) : emptyScheduleValues),
    [eventToEdit],
  );
  const [formValues, setFormValues] = useState<ScheduleFormValues>(initialValues);
  const [activeField, setActiveField] = useState<ScheduleField | null>(null);
  const [draftDate, setDraftDate] = useState(selectedDateKey);
  const [draftTime, setDraftTime] = useState("09:00");
  const initializingRef = useRef(false);
  const syncingFromDraftRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      onDraftChange(null);
      return;
    }

    initializingRef.current = true;
    setFormValues(initialValues);
    setActiveField(null);
    setDraftDate(eventToEdit?.date ?? selectedDateKey);
    setDraftTime("");

    if (eventToEdit) {
      onDraftChange(initialValues);
    }
  }, [eventToEdit, initialValues, isOpen, onDraftChange, selectedDateKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initializingRef.current) {
      initializingRef.current = false;
      return;
    }

    if (syncingFromDraftRef.current) {
      syncingFromDraftRef.current = false;
      return;
    }

    if (scheduleDraft && areDraftsEqual(formValues, scheduleDraft)) {
      return;
    }

    if (!hasDraftContent(formValues)) {
      return;
    }

    onDraftChange(formValues);
  }, [formValues, isOpen, onDraftChange, scheduleDraft]);

  useEffect(() => {
    if (!isOpen || !scheduleDraft) {
      return;
    }

    setFormValues((current) => {
      if (areDraftsEqual(current, scheduleDraft)) {
        return current;
      }

      syncingFromDraftRef.current = true;
      return scheduleDraft;
    });
  }, [isOpen, scheduleDraft]);

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
    setDraftDate(date || selectedDateKey);
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

  const updateTitle = (value: string) => {
    setFormValues((current) => ({
      ...current,
      title: value,
    }));
  };

  return {
    activeField,
    applyTime,
    closeTimeDialog,
    draftDate,
    draftTime,
    formValues,
    isDraftTimeValid,
    isFormValid,
    isTimeSelected,
    isTimeValid,
    openTimeDialog,
    setDraftDate,
    setDraftTime,
    updateTitle,
  };
};
