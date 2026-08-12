"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createCategory,
  updateCategory,
} from "@/app/(admin)/admin/(dashboard)/categorias/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryOption } from "@/lib/admin-categories";
import { slugify } from "@/lib/slugify";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/lib/validations/category";

const NO_PARENT = "__none__";

export function CategoryForm({
  mode,
  initialData,
  parentOptions,
}: {
  mode: "create" | "edit";
  initialData?: CategoryFormValues & { id: string };
  parentOptions: CategoryOption[];
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ?? {
      nombre: "",
      slug: "",
      descripcion: "",
      imagen: null,
      parentId: null,
      orden: 0,
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    const result =
      mode === "create"
        ? await createCategory(values)
        : await updateCategory(initialData!.id, values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === "create"
        ? "Categoría creada correctamente"
        : "Categoría actualizada",
    );
    router.push("/admin/categorias");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-xl flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    if (!slugTouched) {
                      form.setValue("slug", slugify(event.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    setSlugTouched(true);
                    field.onChange(event);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría padre</FormLabel>
              <Select
                value={field.value ?? NO_PARENT}
                onValueChange={(value) =>
                  field.onChange(value === NO_PARENT ? null : value)
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>Sin categoría padre</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value ?? null}
                  onChange={field.onChange}
                  folder="categories"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categorias")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
