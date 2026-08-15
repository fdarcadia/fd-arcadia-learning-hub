import { Check } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  reward?: string;
  completed?: boolean;
  progress?: number;
};

export function ArcadiaTaskCard({
  title,
  subtitle,
  reward,
  completed = false,
  progress,
}: Props) {
  return (
    <div
      className={`arcadia-task ${
        completed
          ? "arcadia-task-complete"
          : ""
      }`}
    >
      <div className="arcadia-task-check">
        {completed ? (
          <Check size={17} strokeWidth={4} />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="arcadia-task-title truncate text-sm">
          {title}
        </p>

        {subtitle ? (
          <p className="mt-1 text-sm text-[#9492a7]">
            {subtitle}
          </p>
        ) : null}

        {typeof progress === "number" ? (
          <div className="arcadia-progress mt-2 h-2">
            <div
              className="arcadia-progress-bar"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, progress)
                )}%`,
              }}
            />
          </div>
        ) : null}
      </div>

      {reward ? (
        <span className="arcadia-badge arcadia-badge-yellow shrink-0">
          {reward}
        </span>
      ) : null}
    </div>
  );
}
