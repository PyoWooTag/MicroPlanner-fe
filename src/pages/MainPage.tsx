import { useState } from "react";

import AddSchedulePage from "@/pages/AddSchedulePage";
import CalendarPage from "@/pages/CalendarPage";
import TimelinePage from "@/pages/TimelinePage";
import type { ScheduleDraft } from "@/types/calendar";

function MainPage() {
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft | null>(null);

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
            scheduleDraft={isScheduleFormOpen ? scheduleDraft : null}
            onAddSchedule={() => setIsScheduleFormOpen(true)}
          />
          <AddSchedulePage
            isOpen={isScheduleFormOpen}
            onDraftChange={setScheduleDraft}
            onClose={() => setIsScheduleFormOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}

export default MainPage;
