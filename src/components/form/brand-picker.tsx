"use client";

import * as React from "react";
import { CheckIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { BRANDS, OTHER_BRAND } from "@/lib/options";
import { cn } from "@/lib/utils";

type BrandPickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  describedBy?: string;
};

const isListed = (v: string) => (BRANDS as readonly string[]).includes(v);

/**
 * Searchable brand list. Typing filters the list; "Andere" switches to a free
 * text field for brands that are not listed.
 */
export function BrandPicker({ id, value, onChange, onBlur, error, describedBy }: BrandPickerProps) {
  const [other, setOther] = React.useState(() => value !== "" && !isListed(value));
  const [query, setQuery] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listId = `${id}-list`;

  const options = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q && !isListed(query) ? BRANDS.filter((b) => b.toLowerCase().includes(q)) : BRANDS;
    return [...matches, OTHER_BRAND];
  }, [query]);

  function select(option: string) {
    setOpen(false);
    if (option === OTHER_BRAND) {
      setOther(true);
      // Keep what the seller typed if it isn't a listed brand.
      onChange(isListed(query) ? "" : query.trim());
      return;
    }
    setQuery(option);
    onChange(option);
  }

  if (other) {
    return (
      <div className="grid gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Marke eingeben"
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
          Zurück zur Markenliste
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
        placeholder="Marke suchen, z. B. Volkswagen"
        autoComplete="off"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          // Only a brand picked from the list counts as a value.
          if (value) onChange("");
        }}
        onBlur={() => {
          // An exact (case-insensitive) match counts as picking it.
          const match = BRANDS.find((b) => b.toLowerCase() === query.trim().toLowerCase());
          if (match && match !== value) select(match);
          setOpen(false);
          onBlur();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            select(options[active] ?? OTHER_BRAND);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Marken"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg"
        >
          {options.map((option, i) => (
            <li
              key={option}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={option === value}
              // mousedown fires before the input's blur, so the tap is not lost.
              onMouseDown={(e) => {
                e.preventDefault();
                select(option);
              }}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between rounded-sm px-3 text-base",
                i === active && "bg-accent",
                option === OTHER_BRAND && "border-t text-muted-foreground",
              )}
            >
              {option === OTHER_BRAND ? "Andere Marke eingeben" : option}
              {option === value && <CheckIcon aria-hidden className="size-4 text-primary" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
