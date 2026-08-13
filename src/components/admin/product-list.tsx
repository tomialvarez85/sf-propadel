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

function ProductRow({ product }: { product: ProductListItem }) {
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

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="bg-muted relative size-10 overflow-hidden rounded-md">
            {product.imagen ? (
              <Image
                src={product.imagen}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder iconClassName="size-4" />
            )}
          </div>
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
    </>
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
          <ProductRow key={product.id} product={product} />
        ))}
      </TableBody>
    </Table>
  );
}
