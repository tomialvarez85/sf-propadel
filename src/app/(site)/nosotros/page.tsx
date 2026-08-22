import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBrandOptions } from "@/lib/product-query";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Nosotros | SF ProPadel",
  description:
    "Conocé la historia de SF ProPadel, tienda especializada en pádel.",
};

const DEFAULT_MISSION =
  "Nacimos de la pasión por el pádel: acercamos a los jugadores de todos los niveles el mejor equipamiento del mercado, con asesoramiento real y precios claros.";

export default async function NosotrosPage() {
  const [settings, brands] = await Promise.all([
    getSiteSettings(),
    getBrandOptions(),
  ]);

  const brandsText =
    brands.length > 0
      ? `Trabajamos con ${brands.map((brand) => brand.nombre).join(", ")} y más.`
      : "Seleccionamos cuidadosamente cada marca que vendemos.";

  const reasons = [
    {
      icon: ShieldCheck,
      title: "Marcas oficiales",
      text: brandsText,
    },
    {
      icon: MessageCircle,
      title: "Atención personalizada",
      text: "Te asesoramos por WhatsApp para elegir el producto justo para tu nivel.",
    },
    {
      icon: Truck,
      title: "Envíos a todo el país",
      text: "Hacemos llegar tu pedido estés donde estés.",
    },
  ];

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-[-0.015em] sm:text-3xl">
            Sobre SF ProPadel
          </h1>
          <p className="text-primary-foreground/90 mt-4 text-lg text-balance">
            {settings?.textoNosotros || DEFAULT_MISSION}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-heading text-2xl font-bold tracking-[-0.015em]">
          Por qué elegirnos
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div key={reason.title} className="flex flex-col gap-3">
                <span className="bg-muted flex size-10 items-center justify-center rounded-full">
                  <Icon className="text-primary size-5" />
                </span>
                <h3 className="text-base font-medium">{reason.title}</h3>
                <p className="text-muted-foreground text-sm">{reason.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿Tenés dudas sobre qué paleta o calzado se adapta mejor a tu
            juego?
          </p>
          <Button asChild className="mt-4">
            <Link href="/contacto">Escribinos</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
