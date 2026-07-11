import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WheelEventHandler } from "react";

import CalendarDayCell from "@/components/calendar/CalendarDayCell";
import type { CalendarCell, CalendarEvent } from "@/types/calendar";
import { WEEKDAYS } from "@/utils/calendar";

type CalendarMonthProps = {
  cells: CalendarCell[];
  eventsByDate: Record<string, CalendarEvent[]>;
  monthTitle: string;
  onMonthWheel: WheelEventHandler<HTMLElement>;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
  onToday: () => void;
};

function CalendarMonth({
  cells,
  eventsByDate,
  monthTitle,
  onMonthWheel,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  onToday,
}: CalendarMonthProps) {
  return (
    <section
      className="month-panel"
      aria-labelledby="month-title"
      onWheel={onMonthWheel}
    >
      <div className="panel-heading">
        <div>
          <h2 id="month-title">{monthTitle}</h2>
        </div>
        <nav className="month-actions" aria-label="캘린더 이동">
          <button className="text-button" type="button" onClick={onToday}>
            오늘
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={onPreviousMonth}
            aria-label="이전 달"
            title="이전 달"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={onNextMonth}
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
        {cells.map((cell, index) => (
          <CalendarDayCell
            cell={cell}
            eventCount={eventsByDate[cell.key]?.length ?? 0}
            isWeekend={index % 7 >= 5}
            key={cell.key}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </section>
  );
}

export default CalendarMonth;
