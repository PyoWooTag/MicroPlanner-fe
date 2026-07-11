import { useCallback } from "react";

import { useCalendarStore } from "@/store/calendarStore";
import type { CalendarEvent } from "@/types/calendar";
import { toDateKey } from "@/utils/calendar";
import {
  getTimeFromLocalDateTime,
  toDate,
  type ScheduleFormValues,
} from "@/utils/scheduleDateTime";

type UseScheduleActionsOptions = {
  eventToEdit: CalendarEvent | null;
  onClose: () => void;
};

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}`;
};

export const useScheduleActions = ({
  eventToEdit,
  onClose,
}: UseScheduleActionsOptions) => {
  const { addEvent, selectDate, selectedDate, updateEvent } = useCalendarStore();
  const selectedDateKey = toDateKey(selectedDate);
  const isEditing = Boolean(eventToEdit);

  const saveSchedule = useCallback(
    (formValues: ScheduleFormValues) => {
      const startDate = toDate(formValues.startAt);
      const nextEvent = {
        id: eventToEdit?.id ?? createEventId(),
        title: formValues.title.trim(),
        date: toDateKey(startDate),
        start: getTimeFromLocalDateTime(formValues.startAt),
        end: getTimeFromLocalDateTime(formValues.endAt),
        type: eventToEdit?.type ?? "light",
      };

      if (eventToEdit) {
        updateEvent(nextEvent);
      } else {
        addEvent(nextEvent);
      }

      selectDate(startDate);
      onClose();
    },
    [addEvent, eventToEdit, onClose, selectDate, updateEvent],
  );

  return {
    isEditing,
    saveSchedule,
    selectedDateKey,
  };
};
