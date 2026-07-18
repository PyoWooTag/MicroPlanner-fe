import TimelinePanel from "@/components/timeline/TimelinePanel";
import { useTimelinePanelController } from "@/hooks/useTimelinePanelController";
import type { ScheduleDraft } from "@/types/calendar";

type TimelinePageProps = {
  editingEventId: string | null;
  isTimelineSlotCreationEnabled: boolean;
  isTimelineTimeSelectionMode: boolean;
  scheduleDraft: ScheduleDraft | null;
  onAddSchedule: (draft?: ScheduleDraft | null) => void;
  onDraftChange: (draft: ScheduleDraft) => void;
  onSelectSchedule: (eventId: string) => void;
};

function TimelinePage({
  editingEventId,
  isTimelineSlotCreationEnabled,
  isTimelineTimeSelectionMode,
  onAddSchedule,
  onDraftChange,
  onSelectSchedule,
  scheduleDraft,
}: TimelinePageProps) {
  const timelinePanel = useTimelinePanelController({
    editingEventId,
    isTimelineSlotCreationEnabled,
    isTimelineTimeSelectionMode,
    onAddSchedule,
    onSelectSchedule,
    scheduleDraft,
    onDraftChange,
  });

  return (
    <TimelinePanel
      {...timelinePanel}
      onAddSchedule={onAddSchedule}
    />
  );
}

export default TimelinePage;
