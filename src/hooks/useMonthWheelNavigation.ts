import { useCallback, useEffect, useRef } from "react";
import type { WheelEvent } from "react";

type UseMonthWheelNavigationOptions = {
  onNextMonth: () => void;
  onPreviousMonth: () => void;
};

const monthWheelThreshold = 80;
const monthWheelCooldown = 420;

export const useMonthWheelNavigation = ({
  onNextMonth,
  onPreviousMonth,
}: UseMonthWheelNavigationOptions) => {
  const wheelDeltaRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelUnlockTimerRef = useRef<number | null>(null);

  const handleMonthWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();

      if (wheelLockedRef.current) {
        return;
      }

      wheelDeltaRef.current += event.deltaY;

      if (Math.abs(wheelDeltaRef.current) < monthWheelThreshold) {
        return;
      }

      if (wheelDeltaRef.current > 0) {
        onNextMonth();
      } else {
        onPreviousMonth();
      }

      wheelDeltaRef.current = 0;
      wheelLockedRef.current = true;

      if (wheelUnlockTimerRef.current) {
        window.clearTimeout(wheelUnlockTimerRef.current);
      }

      wheelUnlockTimerRef.current = window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, monthWheelCooldown);
    },
    [onNextMonth, onPreviousMonth],
  );

  useEffect(() => {
    return () => {
      if (wheelUnlockTimerRef.current) {
        window.clearTimeout(wheelUnlockTimerRef.current);
      }
    };
  }, []);

  return handleMonthWheel;
};
