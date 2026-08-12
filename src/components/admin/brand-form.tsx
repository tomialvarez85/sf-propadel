"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createBrand,
  updateBrand,
} from "@/app/(admin)/admin/(dashboard)/marcas/actions";
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
import { slugify } from "@/lib/slugify";
import { brandSchema, type BrandFormValues } from "@/lib/validations/brand";

export function BrandForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: BrandFormValues & { id: string };
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData ?? { nombre: "", slug: "", logo: null },
  });

  async function onSubmit(values: BrandFormValues) {
    const result =
      mode === "create"
        ? await createBrand(values)
        : await updateBrand(initialData!.id, values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === "create" ? "Marca creada correctamente" : "Marca actualizada",
    );
    router.push("/admin/marcas");
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
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value ?? null}
                  onChange={field.onChange}
                  folder="brands"
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
            onClick={() => router.push("/admin/marcas")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
