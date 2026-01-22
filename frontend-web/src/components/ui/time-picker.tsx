"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [hours, setHours] = useState("23");
  const [minutes, setMinutes] = useState("59");
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (value && isInitialMount.current) {
      const [h, m] = value.split(":");
      setHours(h || "23");
      setMinutes(m || "59");
      isInitialMount.current = false;
    }
  }, [value]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    // Pad before sending to parent
    const paddedHours = hours.padStart(2, "0");
    const paddedMinutes = minutes.padStart(2, "0");
    const newValue = `${paddedHours}:${paddedMinutes}`;

    // Only call onChange if value actually changed
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [hours, minutes]);

  const incrementHours = () => {
    setHours((prev) => {
      const next = (Number.parseInt(prev, 10) + 1) % 24;
      return next.toString().padStart(2, "0");
    });
  };

  const decrementHours = () => {
    setHours((prev) => {
      const next = (Number.parseInt(prev, 10) - 1 + 24) % 24;
      return next.toString().padStart(2, "0");
    });
  };

  const incrementMinutes = () => {
    setMinutes((prev) => {
      const next = (Number.parseInt(prev, 10) + 1) % 60;
      return next.toString().padStart(2, "0");
    });
  };

  const decrementMinutes = () => {
    setMinutes((prev) => {
      const next = (Number.parseInt(prev, 10) - 1 + 60) % 60;
      return next.toString().padStart(2, "0");
    });
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");

    // Allow empty input while typing
    if (val === "") {
      setHours("");
      return;
    }

    // Limit to 2 digits
    const truncated = val.slice(0, 2);
    const num = Number.parseInt(truncated, 10);

    // Auto-correct if value exceeds 23
    if (num > 23) {
      setHours("23");
    } else {
      // Don't pad while typing, just set the value
      setHours(truncated);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");

    // Allow empty input while typing
    if (val === "") {
      setMinutes("");
      return;
    }

    // Limit to 2 digits
    const truncated = val.slice(0, 2);
    const num = Number.parseInt(truncated, 10);

    // Auto-correct if value exceeds 59
    if (num > 59) {
      setMinutes("59");
    } else {
      // Don't pad while typing, just set the value
      setMinutes(truncated);
    }
  };

  const handleHoursBlur = () => {
    // Pad with zero on blur, default to "00" if empty
    setHours((prev) => {
      if (prev === "") {
        return "00";
      }
      return prev.padStart(2, "0");
    });
  };

  const handleMinutesBlur = () => {
    // Pad with zero on blur, default to "00" if empty
    setMinutes((prev) => {
      if (prev === "") {
        return "00";
      }
      return prev.padStart(2, "0");
    });
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      incrementHours();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrementHours();
    } else if (e.key === "Enter" || e.key === "Tab") {
      // Move to minutes on Enter or Tab
      if (e.key === "Enter") {
        e.preventDefault();
      }
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      incrementMinutes();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrementMinutes();
    }
  };

  const handleHoursFocus = () => {
    hoursInputRef.current?.select();
  };

  const handleMinutesFocus = () => {
    minutesInputRef.current?.select();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-1">
        <Button
          className="size-7 p-0"
          disabled={disabled}
          onClick={incrementHours}
          size="icon"
          tabIndex={-1}
          type="button"
          variant="ghost"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Input
          className="h-10 w-14 text-center font-mono text-lg"
          disabled={disabled}
          maxLength={2}
          onBlur={handleHoursBlur}
          onChange={handleHoursChange}
          onFocus={handleHoursFocus}
          onKeyDown={handleHoursKeyDown}
          ref={hoursInputRef}
          value={hours}
        />
        <Button
          className="size-7 p-0"
          disabled={disabled}
          onClick={decrementHours}
          size="icon"
          tabIndex={-1}
          type="button"
          variant="ghost"
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>
      <span className="font-mono text-2xl">:</span>
      <div className="flex flex-col items-center gap-1">
        <Button
          className="size-7 p-0"
          disabled={disabled}
          onClick={incrementMinutes}
          size="icon"
          tabIndex={-1}
          type="button"
          variant="ghost"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Input
          className="h-10 w-14 text-center font-mono text-lg"
          disabled={disabled}
          maxLength={2}
          onBlur={handleMinutesBlur}
          onChange={handleMinutesChange}
          onFocus={handleMinutesFocus}
          onKeyDown={handleMinutesKeyDown}
          ref={minutesInputRef}
          value={minutes}
        />
        <Button
          className="size-7 p-0"
          disabled={disabled}
          onClick={decrementMinutes}
          size="icon"
          tabIndex={-1}
          type="button"
          variant="ghost"
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}
