import { Plus } from "lucide-react";
import { useMemo } from "react";

import { getEventsByDate, useCalendarStore } from "@/store/calendarStore";
import type { CalendarEvent } from "@/types/calendar";
import {
  formatSelectedTitle,
  formatTimelineHour,
  timeToMinutes,
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

function TimelinePage() {
  const { events, selectedDate } = useCalendarStore();
  const selectedEvents = useMemo(
    () => getEventsByDate(events, selectedDate),
    [events, selectedDate],
  );
  const selectedTitle = formatSelectedTitle(selectedDate);

  return (
    <aside className="timeline-panel" aria-labelledby="timeline-title">
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
  );
}

export default TimelinePage;
