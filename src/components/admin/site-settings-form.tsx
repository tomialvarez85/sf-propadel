"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateSiteSettings } from "@/app/(admin)/admin/(dashboard)/configuracion/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from "@/lib/validations/site-settings";

export function SiteSettingsForm({
  initialData,
}: {
  initialData: SiteSettingsFormValues;
}) {
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: SiteSettingsFormValues) {
    const result = await updateSiteSettings(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Configuración guardada");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-2xl flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5491122334455"
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
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/sfpropadel"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contacto</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="hola@sfpropadel.com.ar"
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
              name="emailPedidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email para notificación de pedidos</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="pedidos@sfpropadel.com.ar"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    A esta dirección llega un aviso cada vez que se registra
                    un pedido nuevo. Puede ser la misma que el email de
                    contacto o una distinta.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="horarioAtencion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario de atención</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={"Lun a Vie: 9 a 19hs\nSáb: 9 a 13hs"}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de transferencia</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground -mt-2 text-sm">
              Se muestran en la confirmación del pedido y en el mail al
              cliente después de finalizar la compra. Dejá vacío cualquiera
              que no uses — solo se muestran los campos cargados.
            </p>

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="sf.propadel.mp"
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
              name="cbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBU / CVU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0000003100000000000000"
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
              name="titular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular de la cuenta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SF ProPadel SRL"
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
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Banco Galicia"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barra superior del header</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="textoEnvioGratis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de envío gratis</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Envío gratis en compras mayores a $100.000"
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
              name="textoCuotas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de cuotas</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="6 cuotas sin interés"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiles de género (home)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="imagenGeneroHombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen tile &quot;Hombre&quot;</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value ?? null}
                      onChange={field.onChange}
                      folder="site"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imagenGeneroMujer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen tile &quot;Mujer&quot;</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value ?? null}
                      onChange={field.onChange}
                      folder="site"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Página &quot;Nosotros&quot;</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="textoNosotros"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Contá la historia de SF ProPadel..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
}
