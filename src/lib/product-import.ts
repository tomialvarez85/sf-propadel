// Shared between the client-side preview (import-products-dialog.tsx) and
// the server-side re-validation (productos/actions.ts's importProducts) —
// one validation function, so the preview a user sees can never drift from
// what actually gets created. No framework-specific imports here on
// purpose, so it's safe to import from a "use client" component too.
import { slugify } from "@/lib/slugify";

export const IMPORT_COLUMNS = [
  { key: "nombre", header: "nombre" },
  { key: "descripcion", header: "descripcion" },
  { key: "categoria", header: "categoria" },
  { key: "marca", header: "marca" },
  { key: "genero", header: "genero" },
  { key: "precio", header: "precio" },
  { key: "precioAnterior", header: "precioAnterior" },
  { key: "stock", header: "stock" },
  { key: "destacado", header: "destacado" },
  { key: "enOferta", header: "enOferta" },
  { key: "activo", header: "activo" },
] as const;

export type ImportColumnKey = (typeof IMPORT_COLUMNS)[number]["key"];

/** Shared between the downloadable .xlsx template and the in-dialog format
 * guide, so both always show the exact same example — one source of truth,
 * not two hand-kept copies that can drift. Names match real seed data
 * (Paletas/Bullpadel, Indumentaria/Adidas, Calzado/Nox) so the template
 * also works as a real, importable file if used as-is. */
export const IMPORT_EXAMPLE_ROWS: Record<ImportColumnKey, string | number>[] = [
  {
    nombre: "Paleta Bullpadel Vertex 04",
    descripcion: "Paleta de gama alta, forma diamante, tacto duro.",
    categoria: "Paletas",
    marca: "Bullpadel",
    genero: "",
    precio: 250000,
    precioAnterior: "",
    stock: 10,
    destacado: "Sí",
    enOferta: "No",
    activo: "Sí",
  },
  {
    nombre: "Remera Adidas Padel Tee",
    descripcion: "Remera técnica dry-fit.",
    categoria: "Indumentaria",
    marca: "Adidas",
    genero: "Hombre",
    precio: 35000,
    precioAnterior: 42000,
    stock: 20,
    destacado: "No",
    enOferta: "Sí",
    activo: "Sí",
  },
  {
    nombre: "Zapatillas Nox ML10",
    descripcion: "",
    categoria: "Calzado",
    marca: "Nox",
    genero: "Mujer",
    precio: 90000,
    precioAnterior: "",
    stock: 5,
    destacado: "No",
    enOferta: "No",
    activo: "Sí",
  },
];

export type ImportCategoryOption = { id: string; nombre: string };
export type ImportBrandOption = { id: string; nombre: string };

export type ResolvedImportRow = {
  nombre: string;
  descripcion: string;
  categoryId: string;
  brandId: string;
  genero: "HOMBRE" | "MUJER" | "UNISEX" | null;
  precio: number;
  precioAnterior: number | null;
  stock: number;
  destacado: boolean;
  enOferta: boolean;
  activo: boolean;
};

export type ImportRowResult = {
  rowNumber: number;
  raw: Record<ImportColumnKey, string>;
  errors: string[];
  data: ResolvedImportRow | null;
};

function getField(raw: Record<string, unknown>, header: string): string {
  const target = header.trim().toLowerCase();
  for (const key of Object.keys(raw)) {
    if (key.trim().toLowerCase() === target) {
      const value = raw[key];
      return value === undefined || value === null ? "" : String(value).trim();
    }
  }
  return "";
}

function parseNumberField(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBooleanField(
  value: string,
  defaultValue: boolean,
  fieldLabel: string,
): { value: boolean; error?: string } {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return { value: defaultValue };
  if (["si", "sí", "s"].includes(normalized)) return { value: true };
  if (["no", "n"].includes(normalized)) return { value: false };
  return {
    value: defaultValue,
    error: `${fieldLabel}: "${value}" no es válido (usá Sí o No).`,
  };
}

/** Extracts every column as a raw string, keyed by our own column keys —
 * regardless of header casing/order in the uploaded file. */
export function extractRawRow(
  raw: Record<string, unknown>,
): Record<ImportColumnKey, string> {
  const result = {} as Record<ImportColumnKey, string>;
  for (const column of IMPORT_COLUMNS) {
    result[column.key] = getField(raw, column.header);
  }
  return result;
}

export function validateImportRow(
  raw: Record<string, unknown>,
  rowNumber: number,
  categories: ImportCategoryOption[],
  brands: ImportBrandOption[],
): ImportRowResult {
  const rawStrings = extractRawRow(raw);
  const errors: string[] = [];

  const nombre = rawStrings.nombre;
  if (!nombre) errors.push("Falta el nombre.");

  const descripcion = rawStrings.descripcion;

  const categoriaRaw = rawStrings.categoria;
  let categoryId: string | null = null;
  if (!categoriaRaw) {
    errors.push("Falta la categoría.");
  } else {
    const match = categories.find(
      (c) => c.nombre.trim().toLowerCase() === categoriaRaw.toLowerCase(),
    );
    if (!match) errors.push(`La categoría "${categoriaRaw}" no existe.`);
    else categoryId = match.id;
  }

  const marcaRaw = rawStrings.marca;
  let brandId: string | null = null;
  if (!marcaRaw) {
    errors.push("Falta la marca.");
  } else {
    const match = brands.find(
      (b) => b.nombre.trim().toLowerCase() === marcaRaw.toLowerCase(),
    );
    if (!match) errors.push(`La marca "${marcaRaw}" no existe.`);
    else brandId = match.id;
  }

  const generoRaw = rawStrings.genero;
  let genero: "HOMBRE" | "MUJER" | "UNISEX" | null = null;
  if (generoRaw) {
    const normalized = generoRaw.toLowerCase();
    if (normalized === "hombre") genero = "HOMBRE";
    else if (normalized === "mujer") genero = "MUJER";
    else if (normalized === "unisex") genero = "UNISEX";
    else
      errors.push(
        `Género "${generoRaw}" no válido (usá Hombre, Mujer, Unisex o dejalo vacío).`,
      );
  }

  const precioRaw = rawStrings.precio;
  let precio: number | null = null;
  if (!precioRaw) {
    errors.push("Falta el precio.");
  } else {
    precio = parseNumberField(precioRaw);
    if (precio === null || precio <= 0) {
      errors.push(`Precio "${precioRaw}" no es un número válido.`);
      precio = null;
    }
  }

  const precioAnteriorRaw = rawStrings.precioAnterior;
  let precioAnterior: number | null = null;
  if (precioAnteriorRaw) {
    precioAnterior = parseNumberField(precioAnteriorRaw);
    if (precioAnterior === null || precioAnterior <= 0) {
      errors.push(`Precio anterior "${precioAnteriorRaw}" no es un número válido.`);
      precioAnterior = null;
    }
  }
  if (precio !== null && precioAnterior !== null && precioAnterior <= precio) {
    errors.push("El precio anterior debe ser mayor al precio actual.");
  }

  const stockRaw = rawStrings.stock;
  let stock: number | null = null;
  if (!stockRaw) {
    errors.push("Falta el stock.");
  } else {
    const parsed = parseNumberField(stockRaw);
    if (parsed === null || !Number.isInteger(parsed) || parsed < 0) {
      errors.push(`Stock "${stockRaw}" no es un número entero válido.`);
    } else {
      stock = parsed;
    }
  }

  const destacadoResult = parseBooleanField(rawStrings.destacado, false, "destacado");
  if (destacadoResult.error) errors.push(destacadoResult.error);
  const enOfertaResult = parseBooleanField(rawStrings.enOferta, false, "enOferta");
  if (enOfertaResult.error) errors.push(enOfertaResult.error);
  const activoResult = parseBooleanField(rawStrings.activo, true, "activo");
  if (activoResult.error) errors.push(activoResult.error);

  const data: ResolvedImportRow | null =
    errors.length === 0
      ? {
          nombre,
          descripcion,
          categoryId: categoryId!,
          brandId: brandId!,
          genero,
          precio: precio!,
          precioAnterior,
          stock: stock!,
          destacado: destacadoResult.value,
          enOferta: enOfertaResult.value,
          activo: activoResult.value,
        }
      : null;

  return { rowNumber, raw: rawStrings, errors, data };
}

/** Deterministic across a whole batch: tracks slugs already claimed (by
 * earlier rows in this same import, or by existing products) so two rows
 * that produce the same base slug don't collide. */
export function resolveUniqueSlug(nombre: string, usedSlugs: Set<string>): string {
  const base = slugify(nombre) || "producto";
  let candidate = base;
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }
  usedSlugs.add(candidate);
  return candidate;
}
