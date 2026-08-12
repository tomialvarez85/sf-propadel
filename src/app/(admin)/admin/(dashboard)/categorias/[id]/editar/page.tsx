import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import {
  getAllCategoriesFlat,
  getCategoryForEdit,
  getDescendantIds,
} from "@/lib/admin-categories";

export const metadata: Metadata = {
  title: "Editar categoría | SF ProPadel Admin",
};

export default async function EditarCategoriaPage(
  props: PageProps<"/admin/categorias/[id]/editar">,
) {
  const { id } = await props.params;

  const [category, allCategories] = await Promise.all([
    getCategoryForEdit(id),
    getAllCategoriesFlat(),
  ]);

  if (!category) {
    notFound();
  }

  const excluded = getDescendantIds(id, allCategories);
  excluded.add(id);
  const parentOptions = allCategories.filter((c) => !excluded.has(c.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar categoría
      </h1>
      <CategoryForm
        mode="edit"
        initialData={category}
        parentOptions={parentOptions}
      />
    </div>
  );
}
