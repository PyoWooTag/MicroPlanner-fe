import type { ReactNode } from "react";

type AppFrameProps = {
  isScheduleFormOpen: boolean;
  children: ReactNode;
};

function AppFrame({ children, isScheduleFormOpen }: AppFrameProps) {
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
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppFrame;
