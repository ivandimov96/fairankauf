import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + hint/error, wired up for screen readers via ids. */
export function Field({ id, label, optional, hint, error, className, children }: FieldProps) {
  return (
    // content-start: in a row of fields, a taller neighbour (e.g. with an error
    // message) must not push this field's input down.
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Error messages for fields that sit side by side (PLZ + Ort, Jahr + Monat).
 * Shown once below the whole row, so the inputs stay on one line.
 */
export function FieldErrors({ errors }: { errors: [id: string, message: string | undefined][] }) {
  const shown = errors.filter((e): e is [string, string] => !!e[1]);
  if (shown.length === 0) return null;
  return (
    <div className="grid gap-1">
      {shown.map(([id, message]) => (
        <p key={id} id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ))}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}
