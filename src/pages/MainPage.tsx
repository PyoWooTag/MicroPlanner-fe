import { useMemo, useState } from "react";

import AddSchedulePage from "@/pages/AddSchedulePage";
import CalendarPage from "@/pages/CalendarPage";
import TimelinePage from "@/pages/TimelinePage";
import { useCalendarStore } from "@/store/calendarStore";
import type { ScheduleDraft } from "@/types/calendar";

function MainPage() {
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft | null>(null);
  const events = useCalendarStore((state) => state.events);
  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [editingEventId, events],
  );
  const editingEventDraft = useMemo(
    () =>
      editingEvent
        ? {
            title: editingEvent.title,
            startAt: `${editingEvent.date}T${editingEvent.start}`,
            endAt: `${editingEvent.date}T${editingEvent.end}`,
          }
        : null,
    [editingEvent],
  );
  const activeScheduleDraft = isScheduleFormOpen
    ? scheduleDraft ?? editingEventDraft
    : null;
  const closeScheduleForm = () => {
    setIsScheduleFormOpen(false);
    setEditingEventId(null);
  };
  const openScheduleForm = () => {
    setEditingEventId(null);
    setScheduleDraft(null);
    setIsScheduleFormOpen(true);
  };
  const openEditForm = (eventId: string) => {
    setEditingEventId(eventId);
    setScheduleDraft(null);
    setIsScheduleFormOpen(true);
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-header">
          <div className="brand">
            <h1>조각조각</h1>
          </div>
        </header>

        <main
          className={
            isScheduleFormOpen
              ? "calendar-layout schedule-add-open"
              : "calendar-layout"
          }
        >
          <CalendarPage />
          <TimelinePage
            editingEventId={isScheduleFormOpen ? editingEventId : null}
            scheduleDraft={activeScheduleDraft}
            onAddSchedule={openScheduleForm}
            onDraftChange={setScheduleDraft}
            onEditSchedule={openEditForm}
          />
          <AddSchedulePage
            editingEvent={editingEvent}
            isOpen={isScheduleFormOpen}
            scheduleDraft={activeScheduleDraft}
            onDraftChange={setScheduleDraft}
            onClose={closeScheduleForm}
          />
        </main>
      </div>
    </div>
  );
}

export default MainPage;
