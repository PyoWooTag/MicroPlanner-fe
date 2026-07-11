import type { FormEvent } from "react";

import ScheduleFormPanel from "@/components/schedule/ScheduleFormPanel";
import { useScheduleActions } from "@/hooks/useScheduleActions";
import { useScheduleEditor } from "@/hooks/useScheduleEditor";
import type { CalendarEvent, ScheduleDraft } from "@/types/calendar";

type ScheduleEditorPageProps = {
  eventToEdit: CalendarEvent | null;
  isOpen: boolean;
  scheduleDraft: ScheduleDraft | null;
  onDraftChange: (draft: ScheduleDraft | null) => void;
  onClose: () => void;
};

function ScheduleEditorPage({
  eventToEdit,
  isOpen,
  scheduleDraft,
  onClose,
  onDraftChange,
}: ScheduleEditorPageProps) {
  const { isEditing, saveSchedule, selectedDateKey } = useScheduleActions({
    eventToEdit,
    onClose,
  });
  const editor = useScheduleEditor({
    eventToEdit,
    isOpen,
    onDraftChange,
    scheduleDraft,
    selectedDateKey,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editor.isFormValid) {
      return;
    }

    saveSchedule(editor.formValues);
  };

  return (
    <ScheduleFormPanel
      activeField={editor.activeField}
      draftDate={editor.draftDate}
      draftTime={editor.draftTime}
      formValues={editor.formValues}
      isDraftTimeValid={editor.isDraftTimeValid}
      isEditing={isEditing}
      isFormValid={editor.isFormValid}
      isOpen={isOpen}
      isTimeSelected={editor.isTimeSelected}
      isTimeValid={editor.isTimeValid}
      onApplyTime={editor.applyTime}
      onClose={onClose}
      onCloseTimeDialog={editor.closeTimeDialog}
      onDateChange={editor.setDraftDate}
      onOpenTimeDialog={editor.openTimeDialog}
      onSubmit={handleSubmit}
      onTimeChange={editor.setDraftTime}
      onTitleChange={editor.updateTitle}
    />
  );
}

export default ScheduleEditorPage;
