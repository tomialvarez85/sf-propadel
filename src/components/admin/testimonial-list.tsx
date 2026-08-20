"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import {
  deleteTestimonial,
  moveTestimonial,
  toggleTestimonialActivo,
} from "@/app/(admin)/admin/(dashboard)/testimonios/actions";
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
import type { TestimonialListItem } from "@/lib/admin-testimonials";

function extract(comentario: string, max = 80): string {
  return comentario.length > max ? `${comentario.slice(0, max)}…` : comentario;
}

function TestimonialRow({
  testimonial,
  isFirst,
  isLast,
}: {
  testimonial: TestimonialListItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveTestimonial(testimonial.id, direction);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTestimonial(testimonial.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Testimonio eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-full">
            {testimonial.avatarUrl ? (
              <Image
                src={testimonial.avatarUrl}
                alt={testimonial.nombreCliente}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <User className="text-muted-foreground absolute inset-0 m-auto size-4" />
            )}
          </div>
        </TableCell>
        <TableCell className="font-medium">{testimonial.nombreCliente}</TableCell>
        <TableCell className="text-muted-foreground max-w-80">
          {extract(testimonial.comentario)}
        </TableCell>
        <TableCell>
          <StatusToggleBadge
            label={testimonial.nombreCliente}
            initialActive={testimonial.activo}
            onToggle={(next) => toggleTestimonialActivo(testimonial.id, next)}
            activeMessage="Testimonio activado"
            inactiveMessage="Testimonio desactivado"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Subir ${testimonial.nombreCliente}`}
              disabled={isFirst || isPending}
              onClick={() => handleMove("up")}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Bajar ${testimonial.nombreCliente}`}
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
                href={`/admin/testimonios/${testimonial.id}/editar`}
                aria-label={`Editar ${testimonial.nombreCliente}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${testimonial.nombreCliente}`}
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
            <AlertDialogTitle>¿Eliminar este testimonio?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el testimonio de {testimonial.nombreCliente}? Esta
              acción no se puede deshacer.
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

export function TestimonialList({
  testimonials,
}: {
  testimonials: TestimonialListItem[];
}) {
  if (testimonials.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Todavía no hay testimonios cargados.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Foto</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Comentario</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testimonials.map((testimonial, index) => (
          <TestimonialRow
            key={testimonial.id}
            testimonial={testimonial}
            isFirst={index === 0}
            isLast={index === testimonials.length - 1}
          />
        ))}
      </TableBody>
    </Table>
  );
}
