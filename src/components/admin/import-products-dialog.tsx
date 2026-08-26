"use client";

import { Fragment, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { importProducts } from "@/app/(admin)/admin/(dashboard)/productos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import {
  IMPORT_COLUMNS,
  IMPORT_EXAMPLE_ROWS,
  validateImportRow,
  type ImportBrandOption,
  type ImportCategoryOption,
  type ImportRowResult,
} from "@/lib/product-import";

/** Static preview of the expected spreadsheet shape, shown before the
 * uploader itself — so the format is understood without downloading
 * anything first. Rows come from the same constant the downloadable
 * template uses, so the two never drift apart. */
function FormatGuide() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Formato esperado</h3>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href="/admin/productos/plantilla" download>
            <Download className="size-4" />
            Descargar plantilla
          </a>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {IMPORT_COLUMNS.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {IMPORT_EXAMPLE_ROWS.map((row, index) => (
              <TableRow key={index}>
                {IMPORT_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className="text-muted-foreground max-w-40 truncate whitespace-nowrap"
                  >
                    {row[column.key] === "" ? "—" : String(row[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
        <li>
          <strong className="text-foreground font-medium">categoria</strong> y{" "}
          <strong className="text-foreground font-medium">marca</strong> deben
          coincidir con nombres ya creados en el sistema (no se crean
          automáticamente).
        </li>
        <li>
          <strong className="text-foreground font-medium">destacado</strong>,{" "}
          <strong className="text-foreground font-medium">enOferta</strong> y{" "}
          <strong className="text-foreground font-medium">activo</strong>{" "}
          aceptan Sí/No.
        </li>
        <li>
          El slug se genera automático a partir del nombre, no hace falta
          incluirlo.
        </li>
      </ul>
    </div>
  );
}

export function ImportProductsDialog({
  categories,
  brands,
}: {
  categories: ImportCategoryOption[];
  brands: ImportBrandOption[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<ImportRowResult[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setRows(null);
    setFileName(null);
    setParsing(false);
    setImporting(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setRows(null);

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const parsedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        sheet,
        { defval: "" },
      );

      const validated = parsedRows.map((row, index) =>
        validateImportRow(row, index + 2, categories, brands),
      );
      setRows(validated);

      if (validated.length === 0) {
        toast.error("El archivo no tiene filas de datos.");
      }
    } catch (error) {
      console.error("No se pudo leer el archivo:", error);
      toast.error(
        "No se pudo leer el archivo. Confirmá que sea un .xlsx o .csv válido.",
      );
      setRows(null);
    } finally {
      setParsing(false);
    }
  }

  const validRows = rows?.filter((row) => row.data !== null) ?? [];
  const invalidRows = rows?.filter((row) => row.data === null) ?? [];

  async function handleConfirm() {
    if (validRows.length === 0) return;

    setImporting(true);
    try {
      const result = await importProducts(
        validRows.map((row) => ({ rowNumber: row.rowNumber, raw: row.raw })),
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const parts = [`${result.created} producto${result.created === 1 ? "" : "s"} importado${result.created === 1 ? "" : "s"}`];
      const totalErrors = invalidRows.length + result.errors.length;
      if (totalErrors > 0) {
        parts.push(`${totalErrors} fila${totalErrors === 1 ? "" : "s"} con error`);
      }
      toast.success(parts.join(", "));

      router.refresh();
      setOpen(false);
      reset();
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Importar productos
      </Button>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar productos</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormatGuide />

          <div className="border-border flex flex-col gap-4 border-t pt-4">
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={parsing || importing}
                  onClick={() => inputRef.current?.click()}
                >
                  {fileName ? "Cambiar archivo" : "Elegir archivo"}
                </Button>
                {fileName && (
                  <span className="text-muted-foreground truncate text-sm">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Formato .xlsx o .csv — respetá las columnas de la tabla de
                arriba.
              </p>
            </div>

            {parsing && (
              <p className="text-muted-foreground text-sm">Leyendo archivo...</p>
            )}

            {rows && rows.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="text-primary size-3.5" />
                    {validRows.length} válida{validRows.length === 1 ? "" : "s"}
                  </Badge>
                  {invalidRows.length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="size-3.5" />
                      {invalidRows.length} con error
                    </Badge>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Fila</TableHead>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <Fragment key={row.rowNumber}>
                          <TableRow
                            className={row.data ? undefined : "bg-destructive/5"}
                          >
                            <TableCell className="text-muted-foreground">
                              {row.rowNumber}
                            </TableCell>
                            <TableCell>
                              {row.data ? (
                                <CheckCircle2 className="text-primary size-4" />
                              ) : (
                                <AlertCircle className="text-destructive size-4" />
                              )}
                            </TableCell>
                            <TableCell className="max-w-40 truncate font-medium">
                              {row.raw.nombre || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.raw.categoria || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.raw.marca || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.data
                                ? formatCurrency(row.data.precio)
                                : row.raw.precio || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.raw.stock || "—"}
                            </TableCell>
                          </TableRow>
                          {row.errors.length > 0 && (
                            <TableRow className="bg-destructive/5">
                              <TableCell
                                colSpan={7}
                                className="text-destructive py-1.5 text-xs"
                              >
                                Fila {row.rowNumber}: {row.errors.join(" ")}
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={importing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={validRows.length === 0 || importing || parsing}
            onClick={handleConfirm}
          >
            {importing
              ? "Importando..."
              : `Importar ${validRows.length} producto${validRows.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
