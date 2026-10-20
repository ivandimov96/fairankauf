import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ChoiceGroupProps = {
  name: string;
  legend: string;
  options: Record<string, string>;
  optional?: boolean;
  error?: string;
  /** Grid columns for the choices, e.g. "grid-cols-3 sm:grid-cols-6". Default: two columns. */
  columns?: string;
  className?: string;
  inputProps: Omit<React.ComponentProps<"input">, "type" | "value">;
};

/** Radio buttons styled as large tap targets. Native inputs keep it accessible. */
export function ChoiceGroup({
  name,
  legend,
  options,
  optional,
  error,
  columns = "grid-cols-2",
  className,
  inputProps,
}: ChoiceGroupProps) {
  const errorId = `${name}-error`;
  return (
    <fieldset className={cn("grid content-start gap-2", className)} aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm leading-none font-medium">
        {legend}
        {optional && <span className="ml-2 font-normal text-muted-foreground">(optional)</span>}
      </legend>
      <div className={cn("grid gap-2", columns)}>
        {Object.entries(options).map(([value, label]) => (
          <label
            key={value}
            className={cn(
              "group/choice flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-2 py-2 text-center text-sm font-medium shadow-xs transition-colors select-none hover:border-primary/60",
              "has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
              "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
              error && "border-destructive",
            )}
          >
            <input type="radio" value={value} className="sr-only" {...inputProps} />
            <CheckIcon aria-hidden className="hidden size-4 shrink-0 group-has-[:checked]/choice:block" strokeWidth={3} />
            {label}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
