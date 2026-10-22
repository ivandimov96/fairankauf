"use client";

import * as React from "react";
import { CheckIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ListPickerLabels = {
  /** Placeholder of the search box, e.g. "Marke suchen, z. B. Volkswagen". */
  search: string;
  /** Accessible name of the list, e.g. "Marken". */
  list: string;
  /** The last entry of the list, e.g. "Andere Marke (selbst eingeben)". */
  other: string;
  /** Placeholder of the free-text field, e.g. "Marke eingeben". */
  otherInput: string;
  /** The link back from free text to the list, e.g. "Zurück zur Markenliste". */
  back: string;
};

type ListPickerProps = {
  id: string;
  options: readonly string[];
  labels: ListPickerLabels;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  describedBy?: string;
};

type Item = { value: string; other?: boolean };

const OTHER: Item = { value: "", other: true };

/**
 * Searchable list with a free-text fallback: typing filters the options, the
 * last entry switches to a text field for anything that is not listed.
 */
export function ListPicker({ id, options, labels, value, onChange, onBlur, error, describedBy }: ListPickerProps) {
  const isListed = (v: string) => options.includes(v);
  const [other, setOther] = React.useState(() => value !== "" && !isListed(value));
  const [query, setQuery] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listId = `${id}-list`;

  // The value can change from outside (a restored draft or the landing page's
  // quick start). Adjust local state during render, as React recommends. An
  // empty value is left alone: the picker clears it itself while the seller
  // types, and the text must stay. (A reset is done by remounting with a key.)
  const [seenValue, setSeenValue] = React.useState(value);
  if (value !== seenValue) {
    setSeenValue(value);
    if (value && isListed(value)) {
      setQuery(value);
      setOther(false);
    } else if (value) {
      setOther(true);
    }
  }

  const items = React.useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = q && !isListed(query) ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return [...matches.map((value) => ({ value })), OTHER];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isListed only reads options
  }, [query, options]);

  function select(item: Item) {
    setOpen(false);
    if (item.other) {
      setOther(true);
      // Keep what the seller typed if it isn't a listed entry.
      onChange(isListed(query) ? "" : query.trim());
      return;
    }
    setQuery(item.value);
    onChange(item.value);
  }

  if (other) {
    return (
      <div className="grid gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={labels.otherInput}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={describedBy}
          autoFocus
        />
        <button
          type="button"
          className="justify-self-start text-sm text-primary underline underline-offset-4"
          onClick={() => {
            setOther(false);
            setQuery("");
            onChange("");
          }}
        >
          {labels.back}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
      />
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className="pl-9"
        placeholder={labels.search}
        autoComplete="off"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          // Only an entry picked from the list counts as a value.
          if (value) onChange("");
        }}
        onBlur={() => {
          // An exact (case-insensitive) match counts as picking it.
          const match = options.find((o) => o.toLowerCase() === query.trim().toLowerCase());
          if (match && match !== value) select({ value: match });
          setOpen(false);
          onBlur();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            select(items[active] ?? OTHER);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={labels.list}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg"
        >
          {items.map((item, i) => (
            <li
              key={item.other ? "\u0000other" : item.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={!item.other && item.value === value}
              // mousedown fires before the input's blur, so the tap is not lost.
              onMouseDown={(e) => {
                e.preventDefault();
                select(item);
              }}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between rounded-sm px-3 text-base",
                i === active && "bg-accent",
                item.other && "border-t text-muted-foreground",
              )}
            >
              {item.other ? labels.other : item.value}
              {!item.other && item.value === value && <CheckIcon aria-hidden className="size-4 text-primary" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const BRAND_LABELS: ListPickerLabels = {
  search: "Marke suchen, z. B. Volkswagen",
  list: "Marken",
  other: "Andere Marke (selbst eingeben)",
  otherInput: "Marke eingeben",
  back: "Zurück zur Markenliste",
};

export const MODEL_LABELS: ListPickerLabels = {
  search: "Modell suchen, z. B. Golf",
  list: "Modelle",
  other: "Anderes Modell (selbst eingeben)",
  otherInput: "Modell eingeben",
  back: "Zurück zur Modellliste",
};
