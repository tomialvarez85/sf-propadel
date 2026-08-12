"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseSortOption, type SortOption } from "@/lib/product-sort-options";

const SORT_LABELS: Record<SortOption, string> = {
  relevancia: "Relevancia",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  nuevos: "Más nuevos",
};

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseSortOption(searchParams.get("orden") ?? undefined);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevancia") params.delete("orden");
    else params.set("orden", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
