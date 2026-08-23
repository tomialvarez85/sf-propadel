import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contacto | SF ProPadel",
  description: "Escribinos y te respondemos por WhatsApp.",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-center text-2xl font-bold tracking-[-0.015em]">
        Contacto
      </h1>
      <p className="text-muted-foreground mt-2 text-center">
        ¿Tenés dudas sobre un producto o un pedido? Escribinos y te
        respondemos a la brevedad.
      </p>

      <Card className="[--card-spacing:24px] mt-8">
        <CardContent>
          <h2 className="font-heading mb-5 text-lg font-bold tracking-[-0.015em]">
            Envianos un mensaje
          </h2>
          <ContactForm whatsapp={settings?.whatsapp ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
