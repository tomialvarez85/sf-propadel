// Client-safe: no Prisma import here, so client components can pull this in
// without dragging the (Node-only) database driver into the browser bundle.

export const GENERO_OPTIONS = [
  { value: "hombre", label: "Hombre" },
  { value: "mujer", label: "Mujer" },
  { value: "unisex", label: "Unisex" },
] as const;

export type GeneroOptionValue = (typeof GENERO_OPTIONS)[number]["value"];

export function parseGeneroOption(
  value: string | undefined,
): GeneroOptionValue | undefined {
  return GENERO_OPTIONS.some((option) => option.value === value)
    ? (value as GeneroOptionValue)
    : undefined;
}
