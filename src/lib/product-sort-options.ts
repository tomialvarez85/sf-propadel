// Client-safe: no Prisma import here, so client components can pull this in
// without dragging the (Node-only) database driver into the browser bundle.

export const SORT_OPTIONS = [
  "relevancia",
  "precio-asc",
  "precio-desc",
  "nuevos",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export function parseSortOption(value: string | undefined): SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value ?? "")
    ? (value as SortOption)
    : "relevancia";
}
