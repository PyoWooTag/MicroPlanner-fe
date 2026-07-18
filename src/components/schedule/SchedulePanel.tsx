import type { ReactNode } from "react";

type SchedulePanelProps = {
  actions?: ReactNode;
  actionsLabel?: string;
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  title: string;
  titleId: string;
};

function SchedulePanel({
  actions,
  actionsLabel,
  children,
  className,
  isOpen,
  title,
  titleId,
}: SchedulePanelProps) {
  const panelClassName = ["add-schedule-panel", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={panelClassName}
      aria-hidden={!isOpen}
      aria-labelledby={titleId}
    >
      <div className="schedule-panel-header">
        <h2 id={titleId} className="visually-hidden">
          {title}
        </h2>
        {actions ? (
          <div className="schedule-panel-actions" aria-label={actionsLabel}>
            {actions}
          </div>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export default SchedulePanel;
