"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBanner,
  moveBanner,
} from "@/app/(admin)/admin/(dashboard)/banners/actions";
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
import type { BannerListItem } from "@/lib/admin-banners";

function BannerRow({
  banner,
  isFirst,
  isLast,
}: {
  banner: BannerListItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveBanner(banner.id, direction);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBanner(banner.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Banner eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="bg-muted relative h-10 w-16 overflow-hidden rounded-md">
            <Image src={banner.imagen} alt="" fill className="object-cover" />
          </div>
        </TableCell>
        <TableCell className="font-medium">
          {banner.titulo || (
            <span className="text-muted-foreground">Sin título</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground max-w-48 truncate">
          {banner.link || "—"}
        </TableCell>
        <TableCell>
          <Badge variant={banner.activo ? "default" : "secondary"}>
            {banner.activo ? "Activo" : "Inactivo"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Subir ${banner.titulo ?? "banner"}`}
              disabled={isFirst || isPending}
              onClick={() => handleMove("up")}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Bajar ${banner.titulo ?? "banner"}`}
              disabled={isLast || isPending}
              onClick={() => handleMove("down")}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                href={`/admin/banners/${banner.id}/editar`}
                aria-label={`Editar ${banner.titulo ?? "banner"}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${banner.titulo ?? "banner"}`}
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
            <AlertDialogTitle>¿Eliminar este banner?</AlertDialogTitle>
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

export function BannerList({ banners }: { banners: BannerListItem[] }) {
  if (banners.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Todavía no hay banners cargados.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Imagen</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((banner, index) => (
          <BannerRow
            key={banner.id}
            banner={banner}
            isFirst={index === 0}
            isLast={index === banners.length - 1}
          />
        ))}
      </TableBody>
    </Table>
  );
}
