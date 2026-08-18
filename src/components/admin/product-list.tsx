"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct } from "@/app/(admin)/admin/(dashboard)/productos/actions";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ProductStatusBadge } from "@/components/admin/product-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { ProductListItem } from "@/lib/admin-products";

function useDeleteProduct(product: ProductListItem) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Producto eliminado");
      router.refresh();
    });
  }

  const deleteDialog = (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar &quot;{product.nombre}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirmOpen, setConfirmOpen, deleteDialog };
}

function ProductThumbnail({ product }: { product: ProductListItem }) {
  return (
    <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
      {product.imagen ? (
        <Image src={product.imagen} alt="" fill className="object-cover" />
      ) : (
        <ImagePlaceholder iconClassName="size-4" />
      )}
    </div>
  );
}

/** Desktop table row — used for the `md:table` layout. */
function ProductTableRow({ product }: { product: ProductListItem }) {
  const { setConfirmOpen, deleteDialog } = useDeleteProduct(product);

  return (
    <>
      <TableRow>
        <TableCell>
          <ProductThumbnail product={product} />
        </TableCell>
        <TableCell className="font-medium">{product.nombre}</TableCell>
        <TableCell className="text-muted-foreground">
          {product.categoryNombre}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {product.brandNombre}
        </TableCell>
        <TableCell>{formatCurrency(product.precio)}</TableCell>
        <TableCell>{product.stock}</TableCell>
        <TableCell>
          <ProductStatusBadge
            id={product.id}
            nombre={product.nombre}
            initialActivo={product.activo}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                href={`/admin/productos/${product.id}/editar`}
                aria-label={`Editar ${product.nombre}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${product.nombre}`}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {deleteDialog}
    </>
  );
}

/** Mobile stacked card — a table with 8 columns just hides everything but
 * "Imagen" and "Nombre" off-screen with no scroll affordance below md, so
 * mobile gets its own card layout instead of the same table. */
function ProductCard({ product }: { product: ProductListItem }) {
  const { setConfirmOpen, deleteDialog } = useDeleteProduct(product);

  return (
    <li className="border-border flex flex-col gap-3 border-b py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <ProductThumbnail product={product} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{product.nombre}</p>
          <p className="text-muted-foreground text-xs">
            {product.categoryNombre} · {product.brandNombre}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{formatCurrency(product.precio)}</span>
        <span className="text-muted-foreground">Stock: {product.stock}</span>
      </div>

      <div className="flex items-center justify-between">
        <ProductStatusBadge
          id={product.id}
          nombre={product.nombre}
          initialActivo={product.activo}
        />
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon-sm" className="size-10">
            <Link
              href={`/admin/productos/${product.id}/editar`}
              aria-label={`Editar ${product.nombre}`}
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-10"
            aria-label={`Eliminar ${product.nombre}`}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="text-destructive size-4" />
          </Button>
        </div>
      </div>

      {deleteDialog}
    </li>
  );
}

export function ProductList({
  products,
  hasActiveFilters = false,
}: {
  products: ProductListItem[];
  hasActiveFilters?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        {hasActiveFilters
          ? "Ningún producto coincide con estos filtros."
          : "Todavía no hay productos cargados."}
      </p>
    );
  }

  return (
    <>
      <ul className="md:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductTableRow key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
