import type { CalendarCell } from "@/types/calendar";

type CalendarDayCellProps = {
  cell: CalendarCell;
  eventCount: number;
  isWeekend: boolean;
  onSelectDate: (date: Date) => void;
};

function CalendarDayCell({
  cell,
  eventCount,
  isWeekend,
  onSelectDate,
}: CalendarDayCellProps) {
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
      onClick={() => onSelectDate(cell.date)}
      aria-pressed={cell.isSelected}
      aria-label={`${cell.date.getMonth() + 1}월 ${cell.day}일`}
    >
      <span className="day-number">{cell.day}</span>
      {eventCount > 0 ? (
        <span className="event-dots" aria-label={`${eventCount}개 일정`}>
          <span />
          {eventCount > 1 ? <span /> : null}
        </span>
      ) : null}
    </button>
  );
}

export default CalendarDayCell;
