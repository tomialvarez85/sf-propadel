"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteHomeBlock,
  moveHomeBlock,
  toggleHomeBlockActivo,
} from "@/app/(admin)/admin/(dashboard)/inicio/actions";
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
import type { HomeBlockItem } from "@/lib/home-blocks";

function HomeBlockRow({
  block,
  isFirst,
  isLast,
}: {
  block: HomeBlockItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const label = block.titulo || "Slide sin texto";

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveHomeBlock(block.id, direction);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteHomeBlock(block.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div
            className={
              block.tipo === "BANNER"
                ? "bg-muted relative h-10 w-32 overflow-hidden rounded-md"
                : "bg-muted relative size-12 overflow-hidden rounded-md"
            }
          >
            {/* Miniatura del admin: sin optimizar, para no gastar
                transformaciones de imagen de Vercel en el panel. */}
            <Image
              src={block.imagen}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </TableCell>
        <TableCell className="font-medium">
          {block.titulo || (
            <span className="text-muted-foreground italic">Sin texto</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground max-w-56 truncate">
          {block.link || "—"}
        </TableCell>
        <TableCell>
          <StatusToggleBadge
            label={label}
            initialActive={block.activo}
            onToggle={(next) => toggleHomeBlockActivo(block.id, next)}
            activeMessage="Ahora se muestra en el sitio"
            inactiveMessage="Oculto del sitio"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Subir ${label}`}
              disabled={isFirst || isPending}
              onClick={() => handleMove("up")}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Bajar ${label}`}
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
                href={`/admin/inicio/${block.id}/editar`}
                aria-label={`Editar ${label}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${label}`}
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
            <AlertDialogTitle>¿Eliminar &quot;{label}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si solo querés sacarlo del sitio
              por un tiempo, desactivalo en vez de eliminarlo.
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

export function HomeBlockList({
  blocks,
  emptyText,
}: {
  blocks: HomeBlockItem[];
  emptyText: string;
}) {
  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        {emptyText}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Imagen</TableHead>
          <TableHead>Texto</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blocks.map((block, index) => (
          <HomeBlockRow
            key={block.id}
            block={block}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
          />
        ))}
      </TableBody>
    </Table>
  );
}
