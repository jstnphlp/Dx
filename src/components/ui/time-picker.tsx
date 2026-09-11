"use client";

import { Clock3 } from "lucide-react";
import * as React from "react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  className?: string;
}

function parseTime(value = "09:00") {
  const [rawHour = "9", rawMinute = "0"] = value.split(":");
  const hour24 = Math.max(0, Math.min(23, Number(rawHour)));
  return {
    hour: String(hour24 % 12 || 12),
    minute: String(Math.floor(Number(rawMinute) / 15) * 15).padStart(2, "0"),
    period: hour24 >= 12 ? "PM" : "AM",
  };
}

function toTime(hour: string, minute: string, period: string) {
  const hour12 = Number(hour) % 12;
  const hour24 = period === "PM" ? hour12 + 12 : hour12;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

export function TimePicker({
  name,
  defaultValue = "09:00",
  value,
  onValueChange,
  disabled,
  required,
  "aria-label": ariaLabel = "Choose time",
  className,
}: TimePickerProps) {
  const initial = parseTime(value ?? defaultValue);
  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [period, setPeriod] = React.useState(initial.period);
  const controlled = value !== undefined;
  const current = controlled ? parseTime(value) : { hour, minute, period };
  const time = toTime(current.hour, current.minute, current.period);

  function update(next: Partial<typeof current>) {
    const result = { ...current, ...next };
    if (!controlled) {
      setHour(result.hour);
      setMinute(result.minute);
      setPeriod(result.period);
    }
    onValueChange?.(toTime(result.hour, result.minute, result.period));
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-1.5",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <input type="hidden" name={name} value={time} />
      <Clock3 className="ml-1 size-4 text-muted-foreground" />
      <Select
        aria-label={`${ariaLabel}, hour`}
        value={current.hour}
        onChange={(event) => update({ hour: event.target.value })}
        disabled={disabled}
        required={required}
        className="px-2"
      >
        {Array.from({ length: 12 }, (_, index) => String(index + 1)).map(
          (item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ),
        )}
      </Select>
      <Select
        aria-label={`${ariaLabel}, minutes`}
        value={current.minute}
        onChange={(event) => update({ minute: event.target.value })}
        disabled={disabled}
        required={required}
        className="px-2"
      >
        {["00", "15", "30", "45"].map((item) => (
          <option key={item} value={item}>
            :{item}
          </option>
        ))}
      </Select>
      <Select
        aria-label={`${ariaLabel}, period`}
        value={current.period}
        onChange={(event) => update({ period: event.target.value })}
        disabled={disabled}
        required={required}
        className="px-2"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </Select>
    </div>
  );
}
