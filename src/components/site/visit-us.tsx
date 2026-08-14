import { Clock, MapPin, MessageCircle } from "lucide-react";

import { LocationMap } from "@/components/site/location-map";
import { Button } from "@/components/ui/button";
import type { SiteSettingsData } from "@/lib/site-data";

export function VisitUs({ settings }: { settings: SiteSettingsData }) {
  if (!settings?.direccion) return null;

  const { direccion, horarioAtencion, whatsapp } = settings;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <LocationMap direccion={direccion} className="h-64 lg:h-80" />

        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.015em]">
            Visitá nuestro local
          </h2>
          <p className="text-muted-foreground">
            Probate las paletas, mirá la indumentaria de cerca y llevate tu
            pedido en el momento.
          </p>

          <div className="flex flex-col gap-2 text-sm">
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {direccion}
            </span>
            {horarioAtencion && (
              <span className="flex items-start gap-2 whitespace-pre-line">
                <Clock className="mt-0.5 size-4 shrink-0" />
                {horarioAtencion}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button asChild>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </Button>
            {whatsappHref && (
              <Button asChild variant="outline">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle />
                  Escribinos por WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
