"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBanner,
  moveBanner,
  toggleBannerActivo,
  updateBannerImage,
  updateBannerLink,
  updateBannerTitulo,
} from "@/app/(admin)/admin/(dashboard)/banners/actions";
import { InlineTextCell } from "@/components/admin/inline-edit-cell";
import { InlineImageCell } from "@/components/admin/inline-image-cell";
import { StatusToggleBadge } from "@/components/admin/status-toggle-badge";
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
          <InlineImageCell
            label={banner.titulo ?? "banner"}
            imageUrl={banner.imagen}
            folder="banners"
            recommendedMinSize={{ width: 1920, height: 1080 }}
            thumbnailClassName="h-10 w-16"
            onSave={(url) => updateBannerImage(banner.id, url)}
            successMessage="Imagen actualizada"
          />
        </TableCell>
        <TableCell className="font-medium">
          <InlineTextCell
            value={banner.titulo ?? ""}
            onSave={(value) => updateBannerTitulo(banner.id, value)}
            required={false}
            successMessage="Título actualizado"
          />
        </TableCell>
        <TableCell className="text-muted-foreground max-w-48">
          <InlineTextCell
            value={banner.link ?? ""}
            onSave={(value) => updateBannerLink(banner.id, value)}
            required={false}
            successMessage="Link actualizado"
          />
        </TableCell>
        <TableCell>
          <StatusToggleBadge
            label={banner.titulo ?? "banner"}
            initialActive={banner.activo}
            onToggle={(next) => toggleBannerActivo(banner.id, next)}
            activeMessage="Banner activado"
            inactiveMessage="Banner desactivado"
          />
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
