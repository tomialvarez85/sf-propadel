import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { CategoryTree } from "@/components/admin/category-tree";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryTree } from "@/lib/admin-categories";

export const metadata: Metadata = {
  title: "Categorías | SF ProPadel Admin",
};

export default async function AdminCategoriasPage() {
  const tree = await getCategoryTree();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <Button asChild>
          <Link href="/admin/categorias/nueva">
            <Plus className="size-4" />
            Nueva categoría
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          <CategoryTree nodes={tree} />
        </CardContent>
      </Card>
    </div>
  );
}
