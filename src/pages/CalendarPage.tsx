import CalendarMonth from "@/components/calendar/CalendarMonth";
import { useCalendarMonthController } from "@/hooks/useCalendarMonthController";

function CalendarPage() {
  const calendarMonth = useCalendarMonthController();

  return <CalendarMonth {...calendarMonth} />;
}

export default CalendarPage;
