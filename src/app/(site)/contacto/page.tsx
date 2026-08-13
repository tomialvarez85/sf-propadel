import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contacto | SF ProPadel",
  description: "Escribinos por WhatsApp, teléfono, email o dejanos tu mensaje.",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();

  const contactItems = [
    settings?.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    },
    settings?.whatsapp && {
      icon: Phone,
      label: "Teléfono",
      value: settings.whatsapp,
      href: `tel:+${settings.whatsapp.replace(/\D/g, "")}`,
    },
    settings?.email && {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings?.direccion && {
      icon: MapPin,
      label: "Dirección",
      value: settings.direccion,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.direccion)}`,
    },
  ].filter(Boolean) as {
    icon: typeof MessageCircle;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.015em]">
        Contacto
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        ¿Tenés dudas sobre un producto o un pedido? Escribinos y te
        respondemos a la brevedad.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="[--card-spacing:24px] lg:col-span-3">
          <CardContent className="flex flex-1 flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <h2 className="font-heading mb-5 text-lg font-bold tracking-[-0.015em]">
                Envianos un mensaje
              </h2>
              <ContactForm />
            </div>
          </CardContent>
        </Card>

        {contactItems.length > 0 && (
          <div className="bg-primary text-primary-foreground flex flex-col gap-5 rounded-xl p-6 lg:col-span-2">
            <h2 className="font-heading text-lg font-bold tracking-[-0.015em]">
              Contacto directo
            </h2>

            <div className="flex flex-col gap-1">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const row = (
                  <div className="flex items-start gap-3">
                    <span className="bg-primary-foreground/10 flex size-9 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex flex-col justify-center text-sm">
                      <span className="text-primary-foreground/70">
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </span>
                  </div>
                );
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="-mx-2 rounded-lg px-2 py-2 transition-colors hover:bg-primary-foreground/10"
                  >
                    {row}
                  </a>
                ) : (
                  <div key={item.label} className="px-2 py-2">
                    {row}
                  </div>
                );
              })}
            </div>

            {settings?.direccion && (
              <div className="overflow-hidden rounded-lg">
                <iframe
                  title="Ubicación de SF ProPadel"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(settings.direccion)}&output=embed`}
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
