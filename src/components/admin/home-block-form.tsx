"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createHomeBlock,
  updateHomeBlock,
} from "@/app/(admin)/admin/(dashboard)/inicio/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { HomeBlockItem, HomeBlockTipo } from "@/lib/home-blocks";
import {
  homeBlockSchema,
  type HomeBlockFormValues,
} from "@/lib/validations/home-block";

export function HomeBlockForm({
  tipo,
  initialData,
}: {
  tipo: HomeBlockTipo;
  initialData?: HomeBlockItem;
}) {
  const router = useRouter();
  const isBanner = tipo === "BANNER";

  const form = useForm<HomeBlockFormValues>({
    resolver: zodResolver(homeBlockSchema),
    defaultValues: {
      tipo,
      titulo: initialData?.titulo ?? "",
      imagen: initialData?.imagen ?? "",
      imagenMobile: initialData?.imagenMobile ?? "",
      link: initialData?.link ?? "",
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: HomeBlockFormValues) {
    const result = initialData
      ? await updateHomeBlock(initialData.id, values)
      : await createHomeBlock(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(initialData ? "Cambios guardados" : "Creado correctamente");
    router.push("/admin/inicio");
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
          name="imagen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isBanner ? "Imagen (computadora)" : "Imagen"}
              </FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? "")}
                  folder={isBanner ? "banners" : "home-tiles"}
                  recommendedMinSize={
                    isBanner
                      ? { width: 1920, height: 380 }
                      : { width: 800, height: 800 }
                  }
                />
              </FormControl>
              <FormDescription>
                {isBanner
                  ? "Ideal 1920 × 380 px (muy apaisada). Se muestra a lo ancho de la pantalla con 380 px de alto; lo que sobre arriba y abajo se recorta, así que dejá lo importante en el centro."
                  : "Ideal 800 × 800 px o más. Se recorta para llenar la tarjeta; dejá lo importante en el centro."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isBanner && (
          <FormField
            control={form.control}
            name="imagenMobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen para celular (opcional)</FormLabel>
                <FormControl>
                  <ImageUploader
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? "")}
                    folder="banners"
                    recommendedMinSize={{ width: 750, height: 760 }}
                  />
                </FormControl>
                <FormDescription>
                  Ideal 750 × 760 px (casi cuadrada). Si no cargás una, en
                  celulares se usa la de computadora recortada al centro.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isBanner ? "Texto sobre la imagen (opcional)" : "Texto"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isBanner ? "Nueva colección de paletas 2026" : "Paletas"
                  }
                  {...field}
                />
              </FormControl>
              {isBanner && (
                <FormDescription>
                  Dejalo vacío si la imagen ya trae el texto de la promo.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isBanner ? "Link al hacer click (opcional)" : "Link"}
              </FormLabel>
              <FormControl>
                <Input placeholder="/productos?categoria=paletas" {...field} />
              </FormControl>
              <FormDescription>
                Copiá la dirección de la página del sitio a la que querés llevar
                (desde la barra del navegador, a partir de la primera /). Ej:
                /productos?categoria=bolsos, /productos/nombre-del-producto,
                /usados.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Visible en el sitio</FormLabel>
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
            onClick={() => router.push("/admin/inicio")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
