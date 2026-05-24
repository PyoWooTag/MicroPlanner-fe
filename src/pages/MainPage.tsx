import CalendarPage from "@/pages/CalendarPage";
import TimelinePage from "@/pages/TimelinePage";

function MainPage() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-header">
          <div className="brand">
            <h1>조각조각</h1>
          </div>
        </header>

        <main className="calendar-layout">
          <CalendarPage />
          <TimelinePage />
        </main>
      </div>
    </div>
  );
}

export default MainPage;
