import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { useCalendarStore } from "@/store/calendarStore";
import type { CalendarEvent } from "@/types/calendar";
import {
  formatMonthTitle,
  getCalendarCells,
  WEEKDAYS,
} from "@/utils/calendar";

function CalendarPage() {
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
  const monthTitle = formatMonthTitle(visibleMonth);

  return (
    <section className="month-panel" aria-labelledby="month-title">
      <div className="panel-heading">
        <div>
          <h2 id="month-title">{monthTitle}</h2>
        </div>
        <nav className="month-actions" aria-label="캘린더 이동">
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
  );
}

export default CalendarPage;
