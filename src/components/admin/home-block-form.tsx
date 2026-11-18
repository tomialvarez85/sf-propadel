"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createHomeBlock,
  updateHomeBlock,
} from "@/app/(admin)/admin/(dashboard)/banners/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HomeBlockItem,
  HomeBlockTipo,
  LinkTarget,
} from "@/lib/home-blocks";
import {
  homeBlockSchema,
  type HomeBlockFormValues,
} from "@/lib/validations/home-block";

type LinkType = "ninguno" | "categoria" | "producto" | "url";

function detectLinkType(
  link: string,
  categories: LinkTarget[],
  products: LinkTarget[],
): LinkType {
  if (!link) return "ninguno";
  if (categories.some((target) => target.href === link)) return "categoria";
  if (products.some((target) => target.href === link)) return "producto";
  return "url";
}

/**
 * Selector "Lleva a": categoría, producto o dirección libre. Guarda siempre
 * una dirección en el campo `link` (/slug-categoria, /productos/slug o lo que
 * se escriba), así el sitio no necesita saber de qué tipo es.
 */
function LinkPicker({
  value,
  onChange,
  optional,
  categories,
  products,
}: {
  value: string;
  onChange: (value: string) => void;
  optional: boolean;
  categories: LinkTarget[];
  products: LinkTarget[];
}) {
  const [type, setType] = useState<LinkType>(() =>
    detectLinkType(value, categories, products),
  );
  const [productFilter, setProductFilter] = useState("");
  const filteredProducts = productFilter
    ? products.filter((target) =>
        target.label.toLowerCase().includes(productFilter.toLowerCase()),
      )
    : products;

  function changeType(next: LinkType) {
    setType(next);
    onChange("");
    setProductFilter("");
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={type}
        onValueChange={(next) => changeType(next as LinkType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {optional && <SelectItem value="ninguno">Sin link</SelectItem>}
          <SelectItem value="categoria">Una categoría</SelectItem>
          <SelectItem value="producto">Un producto</SelectItem>
          <SelectItem value="url">Otra dirección (URL libre)</SelectItem>
        </SelectContent>
      </Select>

      {type === "categoria" && (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elegí la categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((target) => (
              <SelectItem key={target.href} value={target.href}>
                {target.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === "producto" && (
        <>
          <Input
            placeholder="Filtrar productos por nombre..."
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
          />
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí el producto" />
            </SelectTrigger>
            <SelectContent>
              {filteredProducts.length === 0 ? (
                <p className="text-muted-foreground px-2 py-1.5 text-sm">
                  Ningún producto coincide.
                </p>
              ) : (
                filteredProducts.map((target) => (
                  <SelectItem key={target.href} value={target.href}>
                    {target.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </>
      )}

      {type === "url" && (
        <Input
          placeholder="/usados  o  /productos?categoria=paletas&oferta=1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export function HomeBlockForm({
  tipo,
  initialData,
  categories,
  products,
}: {
  tipo: HomeBlockTipo;
  initialData?: HomeBlockItem;
  categories: LinkTarget[];
  products: LinkTarget[];
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
    router.push("/admin/banners");
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
                      ? { width: 1152, height: 380 }
                      : { width: 750, height: 500 }
                  }
                />
              </FormControl>
              <FormDescription>
                {isBanner
                  ? "Ideal 2304 × 760 px (bien apaisada, 3 a 1). Se recorta para llenar el banner, así que dejá lo importante (textos, producto) en el centro."
                  : "Ideal 1200 × 800 px (apaisada, 3 a 2). Se recorta para llenar la tarjeta; dejá lo importante en el centro."}
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
                    recommendedMinSize={{ width: 1080, height: 608 }}
                  />
                </FormControl>
                <FormDescription>
                  Ideal 1080 × 608 px (16 a 9). Si no cargás una, en celulares
                  se usa la de computadora recortada a los costados.
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
                {isBanner ? "Texto sobre la imagen (opcional)" : "Título"}
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
              <FormLabel>Al hacer click, lleva a</FormLabel>
              <FormControl>
                <LinkPicker
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  optional={isBanner}
                  categories={categories}
                  products={products}
                />
              </FormControl>
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
            onClick={() => router.push("/admin/banners")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
