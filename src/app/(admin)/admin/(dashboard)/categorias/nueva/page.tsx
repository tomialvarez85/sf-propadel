import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";

export const metadata: Metadata = {
  title: "Nueva categoría | SF ProPadel Admin",
};

export default async function NuevaCategoriaPage() {
  const categories = await getAllCategoriesFlat();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva categoría</h1>
      <CategoryForm mode="create" parentOptions={categories} />
    </div>
  );
}
