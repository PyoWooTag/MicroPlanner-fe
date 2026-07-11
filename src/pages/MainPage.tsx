import AppFrame from "@/components/AppFrame";
import { useScheduleWorkspace } from "@/hooks/useScheduleWorkspace";
import CalendarPage from "@/pages/CalendarPage";
import ScheduleEditorPage from "@/pages/ScheduleEditorPage";
import TimelinePage from "@/pages/TimelinePage";

function MainPage() {
  const {
    activeScheduleDraft,
    closeScheduleForm,
    editingEventId,
    eventToEdit,
    isScheduleFormOpen,
    openEditForm,
    openScheduleForm,
    setScheduleDraft,
  } = useScheduleWorkspace();

  return (
    <AppFrame isScheduleFormOpen={isScheduleFormOpen}>
      <CalendarPage />
      <TimelinePage
        editingEventId={isScheduleFormOpen ? editingEventId : null}
        scheduleDraft={activeScheduleDraft}
        onAddSchedule={openScheduleForm}
        onDraftChange={setScheduleDraft}
        onEditSchedule={openEditForm}
      />
      <ScheduleEditorPage
        eventToEdit={eventToEdit}
        isOpen={isScheduleFormOpen}
        scheduleDraft={activeScheduleDraft}
        onDraftChange={setScheduleDraft}
        onClose={closeScheduleForm}
      />
    </AppFrame>
  );
}

export default MainPage;
