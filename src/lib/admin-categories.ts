import { prisma } from "@/lib/prisma";

export type CategoryTreeNode = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  productCount: number;
  children: CategoryTreeNode[];
};

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombre: true,
        slug: true,
        parentId: true,
        orden: true,
        _count: { select: { products: true } },
      },
    });

    const byId = new Map<string, CategoryTreeNode>();
    for (const category of categories) {
      byId.set(category.id, {
        id: category.id,
        nombre: category.nombre,
        slug: category.slug,
        orden: category.orden,
        productCount: category._count.products,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];
    for (const category of categories) {
      const node = byId.get(category.id)!;
      const parent = category.parentId ? byId.get(category.parentId) : null;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  } catch (error) {
    console.error("No se pudo cargar el árbol de categorías:", error);
    return [];
  }
}

export type CategoryOption = {
  id: string;
  nombre: string;
  parentId: string | null;
};

export async function getAllCategoriesFlat(): Promise<CategoryOption[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, parentId: true },
    });
  } catch (error) {
    console.error("No se pudieron cargar las categorías:", error);
    return [];
  }
}

/** A category can't become its own parent, nor a descendant of itself. */
export function getDescendantIds(
  categoryId: string,
  all: CategoryOption[],
): Set<string> {
  const descendants = new Set<string>();
  let frontier = [categoryId];

  while (frontier.length > 0) {
    const children = all.filter(
      (c) => c.parentId && frontier.includes(c.parentId),
    );
    frontier = children.map((c) => c.id);
    for (const child of children) descendants.add(child.id);
  }

  return descendants;
}

export type CategoryEditData = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  parentId: string | null;
  orden: number;
};

export async function getCategoryForEdit(
  id: string,
): Promise<CategoryEditData | null> {
  try {
    return await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        parentId: true,
        orden: true,
      },
    });
  } catch (error) {
    console.error("No se pudo cargar la categoría:", error);
    return null;
  }
}
