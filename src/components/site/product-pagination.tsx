import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    params.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("gap");
    result.push(sorted[i]);
  }
  return result;
}

export function ProductPagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex items-center justify-center gap-1"
    >
      {page <= 1 ? (
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref(basePath, searchParams, page - 1)}>
            Anterior
          </Link>
        </Button>
      )}

      {pageWindow(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="text-muted-foreground px-2">
            …
          </span>
        ) : (
          <Button
            key={item}
            asChild
            variant={item === page ? "default" : "ghost"}
            size="sm"
          >
            <Link href={buildHref(basePath, searchParams, item)}>{item}</Link>
          </Button>
        ),
      )}

      {page >= totalPages ? (
        <Button variant="outline" size="sm" disabled>
          Siguiente
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref(basePath, searchParams, page + 1)}>
            Siguiente
          </Link>
        </Button>
      )}
    </nav>
  );
}
