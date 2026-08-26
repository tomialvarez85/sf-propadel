"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type SaveResult = { success: boolean; error?: string };

const displayClassName =
  "group/cell focus-visible:ring-ring/50 -mx-2 flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 disabled:cursor-wait";

function EditIcon({ isPending }: { isPending: boolean }) {
  return (
    <Pencil
      className={cn(
        "text-muted-foreground size-3 shrink-0 opacity-0 transition-opacity group-hover/cell:opacity-100",
        isPending && "opacity-100",
      )}
    />
  );
}

/**
 * Inline text field — click to edit, Enter/blur saves, Escape cancels.
 * Entity-agnostic: the caller supplies `onSave`, so this same component
 * backs Nombre across products, categories, and brands.
 */
export function InlineTextCell({
  value,
  onSave,
  successMessage = "Cambio guardado",
  required = true,
  requiredError = "Este campo no puede estar vacío.",
  className,
}: {
  value: string;
  onSave: (value: string) => Promise<SaveResult>;
  successMessage?: string;
  /** Set false for optional fields — empty saves as "". */
  required?: boolean;
  requiredError?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  // Enter unmounts the input while it's still focused, which fires a native
  // blur on the way out — without this guard that re-invokes commit() a
  // second time (once from the keydown, once from the resulting blur).
  const settledRef = useRef(false);

  useEffect(() => {
    if (editing) {
      settledRef.current = false;
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    if (settledRef.current) return;
    settledRef.current = true;

    const trimmed = draft.trim();
    if (required && !trimmed) {
      toast.error(requiredError);
      setDraft(current);
      setEditing(false);
      return;
    }
    setEditing(false);
    if (trimmed === current) return;

    const previous = current;
    setCurrent(trimmed);
    startTransition(async () => {
      const result = await onSave(trimmed);
      if (!result.success) {
        setCurrent(previous);
        setDraft(previous);
        toast.error(result.error ?? "No se pudo guardar el cambio.");
        return;
      }
      toast.success(successMessage);
    });
  }

  function cancel() {
    settledRef.current = true;
    setDraft(current);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
        disabled={isPending}
        className={cn(
          "border-primary bg-background -mx-2 w-full min-w-0 rounded-md border px-2 py-1 text-sm outline-none",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(current);
        setEditing(true);
      }}
      disabled={isPending}
      className={cn(displayClassName, isPending && "opacity-50", className)}
    >
      <span className="truncate">
        {current || <span className="text-muted-foreground">—</span>}
      </span>
      <EditIcon isPending={isPending} />
    </button>
  );
}

/** Inline number field — same click-to-edit pattern as InlineTextCell, but
 * numeric input with caller-supplied validation/formatting (precio/stock on
 * products today, easy to reuse for any other numeric column later). */
export function InlineNumberCell({
  value,
  onSave,
  validate,
  format = "integer",
  step = "1",
  successMessage = "Cambio guardado",
}: {
  value: number;
  onSave: (value: number) => Promise<SaveResult>;
  /** Return an error message to block the save, or null when valid. */
  validate?: (value: number) => string | null;
  format?: "currency" | "integer";
  step?: string;
  successMessage?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  // See InlineTextCell — guards against Enter's keydown-then-blur double fire.
  const settledRef = useRef(false);

  useEffect(() => {
    if (editing) {
      settledRef.current = false;
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    if (settledRef.current) return;
    settledRef.current = true;

    const parsed = Number(draft);
    const validationError = validate?.(parsed);
    if (validationError) {
      toast.error(validationError);
      setDraft(String(current));
      setEditing(false);
      return;
    }

    setEditing(false);
    if (parsed === current) return;

    const previous = current;
    setCurrent(parsed);
    startTransition(async () => {
      const result = await onSave(parsed);
      if (!result.success) {
        setCurrent(previous);
        setDraft(String(previous));
        toast.error(result.error ?? "No se pudo guardar el cambio.");
        return;
      }
      toast.success(successMessage);
    });
  }

  function cancel() {
    settledRef.current = true;
    setDraft(String(current));
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        step={step}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
        disabled={isPending}
        className="border-primary bg-background -mx-2 w-24 min-w-0 rounded-md border px-2 py-1 text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(current));
        setEditing(true);
      }}
      disabled={isPending}
      className={cn(displayClassName, isPending && "opacity-50")}
    >
      <span className="truncate">
        {format === "currency" ? formatCurrency(current) : current}
      </span>
      <EditIcon isPending={isPending} />
    </button>
  );
}

/** Inline select field — click to reveal a real Select, saves as soon as an
 * option is picked. Backs categoría/marca on products, and (elsewhere)
 * categoría padre — anywhere a row picks one option from a fixed list. */
export function InlineSelectCell({
  valueId,
  valueLabel,
  options,
  onSave,
  successMessage = "Cambio guardado",
  className,
}: {
  valueId: string;
  valueLabel: string;
  options: { id: string; nombre: string }[];
  onSave: (id: string) => Promise<SaveResult>;
  successMessage?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState({ id: valueId, nombre: valueLabel });
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextId: string) {
    if (nextId === current.id) return;
    const nextOption = options.find((option) => option.id === nextId);
    if (!nextOption) return;

    const previous = current;
    setCurrent(nextOption);
    startTransition(async () => {
      const result = await onSave(nextId);
      if (!result.success) {
        setCurrent(previous);
        toast.error(result.error ?? "No se pudo guardar el cambio.");
        return;
      }
      toast.success(successMessage);
    });
  }

  if (editing) {
    return (
      <Select
        defaultOpen
        value={current.id}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (!open) setEditing(false);
        }}
      >
        <SelectTrigger size="sm" className="-mx-2 w-[calc(100%+1rem)] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      disabled={isPending}
      className={cn(displayClassName, isPending && "opacity-50", className)}
    >
      <span className="truncate">{current.nombre}</span>
      <EditIcon isPending={isPending} />
    </button>
  );
}
