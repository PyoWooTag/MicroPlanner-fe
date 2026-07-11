import { useMemo, useState } from "react";

import { useCalendarStore } from "@/store/calendarStore";
import type { ScheduleDraft } from "@/types/calendar";
import { toScheduleDraft } from "@/utils/scheduleDateTime";

export const useScheduleWorkspace = () => {
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft | null>(null);
  const events = useCalendarStore((state) => state.events);
  const eventToEdit = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [editingEventId, events],
  );
  const eventToEditDraft = useMemo(
    () => (eventToEdit ? toScheduleDraft(eventToEdit) : null),
    [eventToEdit],
  );
  const activeScheduleDraft = isScheduleFormOpen
    ? scheduleDraft ?? eventToEditDraft
    : null;

  const closeScheduleForm = () => {
    setIsScheduleFormOpen(false);
    setEditingEventId(null);
    setScheduleDraft(null);
  };

  const openScheduleForm = (draft: ScheduleDraft | null = null) => {
    setEditingEventId(null);
    setScheduleDraft(draft);
    setIsScheduleFormOpen(true);
  };

  const openEditForm = (eventId: string) => {
    setEditingEventId(eventId);
    setScheduleDraft(null);
    setIsScheduleFormOpen(true);
  };

  return {
    activeScheduleDraft,
    closeScheduleForm,
    editingEventId,
    eventToEdit,
    isScheduleFormOpen,
    openEditForm,
    openScheduleForm,
    setScheduleDraft,
  };
};
