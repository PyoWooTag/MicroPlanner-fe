import { useMemo, useState } from "react";

import { useCalendarStore } from "@/store/calendarStore";
import type { ScheduleDraft } from "@/types/calendar";
import { toScheduleDraft } from "@/utils/scheduleDateTime";

type SchedulePanelMode = "closed" | "detail" | "editor";

export const useScheduleWorkspace = () => {
  const [panelMode, setPanelMode] = useState<SchedulePanelMode>("closed");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft | null>(null);
  const { deleteEvent, events } = useCalendarStore();
  const eventToEdit = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId, events],
  );
  const eventToEditDraft = useMemo(
    () => (eventToEdit ? toScheduleDraft(eventToEdit) : null),
    [eventToEdit],
  );
  const isEditorOpen = panelMode === "editor";
  const isDetailOpen = panelMode === "detail";
  const isSidePanelOpen = panelMode !== "closed";
  const activeScheduleDraft = isEditorOpen
    ? scheduleDraft ?? eventToEditDraft
    : null;

  const closeSidePanel = () => {
    setPanelMode("closed");
    setSelectedEventId(null);
    setScheduleDraft(null);
  };

  const closeScheduleEditor = () => {
    setScheduleDraft(null);

    if (selectedEventId) {
      setPanelMode("detail");
      return;
    }

    setPanelMode("closed");
  };

  const openScheduleForm = (draft: ScheduleDraft | null = null) => {
    setSelectedEventId(null);
    setScheduleDraft(draft);
    setPanelMode("editor");
  };

  const openScheduleDetail = (eventId: string) => {
    setSelectedEventId(eventId);
    setScheduleDraft(null);
    setPanelMode("detail");
  };

  const openScheduleEditor = () => {
    setScheduleDraft(null);
    setPanelMode("editor");
  };

  const deleteSelectedEvent = () => {
    if (!selectedEventId) {
      return;
    }

    deleteEvent(selectedEventId);
    closeSidePanel();
  };

  return {
    activeScheduleDraft,
    closeScheduleEditor,
    closeSidePanel,
    deleteSelectedEvent,
    eventToEdit,
    isDetailOpen,
    isEditorOpen,
    isSidePanelOpen,
    openScheduleDetail,
    openScheduleEditor,
    openScheduleForm,
    selectedEventId,
    setScheduleDraft,
  };
};
