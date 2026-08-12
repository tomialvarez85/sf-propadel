import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
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
      href: undefined,
    },
  ].filter(Boolean) as {
    icon: typeof MessageCircle;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        ¿Tenés dudas sobre un producto o un pedido? Escribinos y te respondemos
        a la brevedad.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {contactItems.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">Contacto directo</h2>
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <span className="flex items-start gap-3 text-sm">
                  <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="text-muted-foreground block">
                      {item.label}
                    </span>
                    {item.value}
                  </span>
                </span>
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
                  className="hover:text-primary transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
