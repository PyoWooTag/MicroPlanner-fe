import TimelinePanel from "@/components/timeline/TimelinePanel";
import { useTimelinePanelController } from "@/hooks/useTimelinePanelController";
import type { ScheduleDraft } from "@/types/calendar";

type TimelinePageProps = {
  editingEventId: string | null;
  scheduleDraft: ScheduleDraft | null;
  onAddSchedule: () => void;
  onDraftChange: (draft: ScheduleDraft) => void;
  onEditSchedule: (eventId: string) => void;
};

function TimelinePage({
  editingEventId,
  onAddSchedule,
  onDraftChange,
  onEditSchedule,
  scheduleDraft,
}: TimelinePageProps) {
  const timelinePanel = useTimelinePanelController({
    editingEventId,
    scheduleDraft,
    onDraftChange,
  });

  return (
    <TimelinePanel
      {...timelinePanel}
      onAddSchedule={onAddSchedule}
      onEditSchedule={onEditSchedule}
    />
  );
}

export default TimelinePage;
