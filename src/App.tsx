import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useMemo } from "react";

import { getEventsByDate, useCalendarStore } from "@/store/calendarStore";
import type { CalendarEvent } from "@/types/calendar";
import {
  formatMonthTitle,
  formatSelectedTitle,
  formatTimelineHour,
  getCalendarCells,
  timeToMinutes,
  WEEKDAYS,
} from "@/utils/calendar";

const timeSlots = Array.from({ length: 24 }, (_, index) => index);
const timelineStart = 0;
const timelineEnd = 24 * 60;
const minuteHeight = 0.95;

const getEventTone = (type: CalendarEvent["type"]) => {
  if (type === "deep") {
    return "event-card event-card-deep";
  }

  if (type === "routine") {
    return "event-card event-card-routine";
  }

  return "event-card event-card-light";
};

function App() {
  const {
    events,
    goNextMonth,
    goPreviousMonth,
    goToday,
    selectDate,
    selectedDate,
    visibleMonth,
  } = useCalendarStore();

  const cells = useMemo(
    () => getCalendarCells(visibleMonth, selectedDate),
    [selectedDate, visibleMonth],
  );
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.date] = [...(acc[event.date] ?? []), event];
      return acc;
    }, {});
  }, [events]);
  const selectedEvents = useMemo(
    () => getEventsByDate(events, selectedDate),
    [events, selectedDate],
  );
  const monthTitle = formatMonthTitle(visibleMonth);
  const selectedTitle = formatSelectedTitle(selectedDate);

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-header">
          <div className="brand">
            <h1>조각조각</h1>
          </div>

          <nav className="header-actions" aria-label="캘린더 이동">
            <button className="text-button" type="button" onClick={goToday}>
              오늘
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={goPreviousMonth}
              aria-label="이전 달"
              title="이전 달"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={goNextMonth}
              aria-label="다음 달"
              title="다음 달"
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </header>

        <main className="calendar-layout">
          <section className="month-panel" aria-labelledby="month-title">
            <div className="panel-heading">
              <div>
                <h2 id="month-title">{monthTitle}</h2>
              </div>
            </div>

            <div className="weekday-row" aria-hidden="true">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="month-grid">
              {cells.map((cell, index) => {
                const cellEvents = eventsByDate[cell.key] ?? [];
                const isWeekend = index % 7 >= 5;

                return (
                  <button
                    key={cell.key}
                    className={[
                      "day-cell",
                      cell.isCurrentMonth ? "" : "day-cell-muted",
                      cell.isSelected ? "day-cell-selected" : "",
                      cell.isToday ? "day-cell-today" : "",
                      isWeekend ? "day-cell-weekend" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    onClick={() => selectDate(cell.date)}
                    aria-pressed={cell.isSelected}
                    aria-label={`${cell.date.getMonth() + 1}월 ${cell.day}일`}
                  >
                    <span className="day-number">{cell.day}</span>
                    {cellEvents.length > 0 ? (
                      <span className="event-dots" aria-label={`${cellEvents.length}개 일정`}>
                        <span />
                        {cellEvents.length > 1 ? <span /> : null}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <aside
            className="timeline-panel"
            aria-labelledby="timeline-title"
          >
            <div className="timeline-header">
              <div>
                <h2 id="timeline-title">{selectedTitle}</h2>
              </div>
            </div>

            <div className="timeline-scroll">
              <div
                className="timeline-track"
                style={{ minHeight: (timelineEnd - timelineStart) * minuteHeight }}
              >
                {timeSlots.map((hour) => (
                  <div
                    className="time-slot"
                    key={hour}
                    style={{ height: 60 * minuteHeight }}
                  >
                    <span>{formatTimelineHour(hour)}</span>
                  </div>
                ))}

                {selectedEvents.map((event) => {
                  const start = timeToMinutes(event.start);
                  const end = timeToMinutes(event.end);
                  const top = Math.max(0, start - timelineStart) * minuteHeight;
                  const height = Math.max(52, end - start) * minuteHeight;

                  return (
                    <article
                      className={getEventTone(event.type)}
                      key={event.id}
                      style={{ top, height }}
                    >
                      <h3>{event.title}</h3>
                      <p>
                        {event.start} - {event.end}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="floating-actions" aria-label="빠른 작업">
              <button
                className="floating-button floating-button-primary"
                type="button"
                aria-label="일정 추가"
                title="일정 추가"
              >
                <Plus size={22} />
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
