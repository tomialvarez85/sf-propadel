"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createTestimonial,
  updateTestimonial,
} from "@/app/(admin)/admin/(dashboard)/testimonios/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  testimonialSchema,
  type TestimonialFormValues,
} from "@/lib/validations/testimonial";

export function TestimonialForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: TestimonialFormValues & { id: string };
}) {
  const router = useRouter();

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initialData ?? {
      nombreCliente: "",
      comentario: "",
      avatarUrl: "",
      activo: true,
    },
  });

  async function onSubmit(values: TestimonialFormValues) {
    const result =
      mode === "create"
        ? await createTestimonial(values)
        : await updateTestimonial(initialData!.id, values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === "create"
        ? "Testimonio creado correctamente"
        : "Testimonio actualizado",
    );
    router.push("/admin/testimonios");
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
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto (opcional)</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? "")}
                  folder="testimonios"
                  cropAspect={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombreCliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del cliente</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comentario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Excelente atención, las paletas llegaron..."
                  rows={4}
                  {...field}
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

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/testimonios")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
