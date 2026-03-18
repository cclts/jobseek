"use client";

import { Trans } from "@lingui/react/macro";

export type TimeRange = "hour" | "day" | "week";

const options: { value: TimeRange; label: React.ReactNode }[] = [
  {
    value: "hour",
    label: (
      <Trans id="watchlists.timeRange.hour" comment="Time range option: last hour">
        Last hour
      </Trans>
    ),
  },
  {
    value: "day",
    label: (
      <Trans id="watchlists.timeRange.day" comment="Time range option: last day">
        Last day
      </Trans>
    ),
  },
  {
    value: "week",
    label: (
      <Trans id="watchlists.timeRange.week" comment="Time range option: last week">
        Last week
      </Trans>
    ),
  },
];

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border-soft">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer first:rounded-l-md last:rounded-r-md ${
            value === opt.value
              ? "bg-primary text-primary-contrast"
              : "text-muted hover:text-foreground hover:bg-border-soft"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
