import type { ReactNode } from "react";

type AppFrameProps = {
  isSidePanelOpen: boolean;
  children: ReactNode;
};

function AppFrame({ children, isSidePanelOpen }: AppFrameProps) {
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
            isSidePanelOpen
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
