"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteCategory,
  updateCategoryNombre,
} from "@/app/(admin)/admin/(dashboard)/categorias/actions";
import { InlineTextCell } from "@/components/admin/inline-edit-cell";
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
import type { CategoryTreeNode } from "@/lib/admin-categories";

function CategoryRow({
  node,
  depth,
}: {
  node: CategoryTreeNode;
  depth: number;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(node.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría eliminada");
      router.refresh();
    });
  }

  return (
    <>
      <div
        className="border-border flex items-center gap-3 border-b py-2.5 last:border-0"
        style={{ paddingLeft: depth * 28 }}
      >
        <div className="min-w-0 flex-1">
          <InlineTextCell
            value={node.nombre}
            onSave={(value) => updateCategoryNombre(node.id, value)}
            requiredError="Ingresá un nombre."
            successMessage="Nombre actualizado"
            className="text-sm font-medium"
          />
          <p className="text-muted-foreground truncate text-xs">/{node.slug}</p>
        </div>

        <Badge variant="secondary">
          {node.productCount} producto{node.productCount === 1 ? "" : "s"}
        </Badge>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon-sm">
            <Link
              href={`/admin/categorias/${node.id}/editar`}
              aria-label={`Editar ${node.nombre}`}
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Eliminar ${node.nombre}`}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="text-destructive size-4" />
          </Button>
        </div>
      </div>

      {node.children.map((child) => (
        <CategoryRow key={child.id} node={child} depth={depth + 1} />
      ))}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar &quot;{node.nombre}&quot;?
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

export function CategoryTree({ nodes }: { nodes: CategoryTreeNode[] }) {
  if (nodes.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Todavía no hay categorías cargadas.
      </p>
    );
  }

  return (
    <div>
      {nodes.map((node) => (
        <CategoryRow key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
