"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact";

/** No backend for this form — submitting it just builds a wa.me message
 * from the fields and hands the customer off to WhatsApp, the same
 * pattern used everywhere else on the site (product detail, floating
 * button) instead of storing an email inquiry. */
export function ContactForm({ whatsapp }: { whatsapp: string | null }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { nombre: "", email: "", mensaje: "" },
  });

  function onSubmit(values: ContactFormValues) {
    if (!whatsapp) {
      toast.error(
        "No hay un WhatsApp configurado todavía. Escribinos por email mientras tanto.",
      );
      return;
    }

    const message = `Hola! Soy ${values.nombre} (${values.email}). ${values.mensaje}`;
    const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    toast.success("Te llevamos a WhatsApp para enviar tu mensaje...");
    window.open(href, "_blank", "noopener,noreferrer");
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="¿En qué te podemos ayudar?"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </form>
    </Form>
  );
}
