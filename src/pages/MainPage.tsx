import AppFrame from "@/components/AppFrame";
import ScheduleDetailPanel from "@/components/schedule/ScheduleDetailPanel";
import { useScheduleWorkspace } from "@/hooks/useScheduleWorkspace";
import CalendarPage from "@/pages/CalendarPage";
import ScheduleEditorPage from "@/pages/ScheduleEditorPage";
import TimelinePage from "@/pages/TimelinePage";

function MainPage() {
  const {
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
  } = useScheduleWorkspace();
  const isTimelineTimeSelectionMode = isEditorOpen;
  const isTimelineSlotCreationEnabled = !isDetailOpen;

  return (
    <AppFrame isSidePanelOpen={isSidePanelOpen}>
      <CalendarPage />
      <TimelinePage
        editingEventId={isEditorOpen ? selectedEventId : null}
        isTimelineSlotCreationEnabled={isTimelineSlotCreationEnabled}
        isTimelineTimeSelectionMode={isTimelineTimeSelectionMode}
        scheduleDraft={activeScheduleDraft}
        onAddSchedule={openScheduleForm}
        onDraftChange={setScheduleDraft}
        onSelectSchedule={openScheduleDetail}
      />
      <ScheduleDetailPanel
        event={eventToEdit}
        isOpen={isDetailOpen}
        onClose={closeSidePanel}
        onDelete={deleteSelectedEvent}
        onEdit={openScheduleEditor}
      />
      <ScheduleEditorPage
        eventToEdit={eventToEdit}
        isOpen={isEditorOpen}
        scheduleDraft={activeScheduleDraft}
        onDraftChange={setScheduleDraft}
        onClose={closeScheduleEditor}
      />
    </AppFrame>
  );
}

export default MainPage;
