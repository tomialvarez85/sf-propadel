"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createBanner,
  updateBanner,
} from "@/app/(admin)/admin/(dashboard)/banners/actions";
import { BannerPreview } from "@/components/admin/banner-preview";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { bannerSchema, type BannerFormValues } from "@/lib/validations/banner";

export function BannerForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: BannerFormValues & { id: string };
}) {
  const router = useRouter();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialData ?? {
      imagen: "",
      link: "",
      titulo: "",
      activo: true,
    },
  });

  const imagen = form.watch("imagen");
  const titulo = form.watch("titulo");

  async function onSubmit(values: BannerFormValues) {
    const result =
      mode === "create"
        ? await createBanner(values)
        : await updateBanner(initialData!.id, values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === "create" ? "Banner creado correctamente" : "Banner actualizado",
    );
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
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? "")}
                  folder="banners"
                  recommendedMinSize={{ width: 1920, height: 1080 }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link de destino (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="/productos?categoria=paletas o https://..."
                  {...field}
                  value={field.value ?? ""}
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
              <FormLabel className="font-normal">Activo</FormLabel>
            </FormItem>
          )}
        />

        <BannerPreview imagen={imagen || null} titulo={titulo} />

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
