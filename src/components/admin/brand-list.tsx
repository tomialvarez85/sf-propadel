"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBrand,
  updateBrandImage,
  updateBrandNombre,
} from "@/app/(admin)/admin/(dashboard)/marcas/actions";
import { InlineTextCell } from "@/components/admin/inline-edit-cell";
import { InlineImageCell } from "@/components/admin/inline-image-cell";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BrandListItem } from "@/lib/admin-brands";

function BrandRow({ brand }: { brand: BrandListItem }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBrand(brand.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Marca eliminada");
      router.refresh();
    });
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <InlineImageCell
            label={brand.nombre}
            imageUrl={brand.logo}
            folder="brands"
            fit="contain"
            onSave={(url) => updateBrandImage(brand.id, url)}
            successMessage="Logo actualizado"
          />
        </TableCell>
        <TableCell className="font-medium">
          <InlineTextCell
            value={brand.nombre}
            onSave={(value) => updateBrandNombre(brand.id, value)}
            requiredError="Ingresá un nombre."
            successMessage="Nombre actualizado"
          />
        </TableCell>
        <TableCell className="text-muted-foreground">/{brand.slug}</TableCell>
        <TableCell>
          <Badge variant="secondary">
            {brand.productCount} producto{brand.productCount === 1 ? "" : "s"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                href={`/admin/marcas/${brand.id}/editar`}
                aria-label={`Editar ${brand.nombre}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${brand.nombre}`}
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
              ¿Eliminar &quot;{brand.nombre}&quot;?
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

export function BrandList({ brands }: { brands: BrandListItem[] }) {
  if (brands.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Todavía no hay marcas cargadas.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => (
          <BrandRow key={brand.id} brand={brand} />
        ))}
      </TableBody>
    </Table>
  );
}
