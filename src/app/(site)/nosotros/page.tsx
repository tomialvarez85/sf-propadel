import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Nosotros | SF ProPadel",
  description:
    "Conocé la historia de SF ProPadel, tienda especializada en pádel.",
};

function DefaultContent() {
  return (
    <>
      <p>
        SF ProPadel nació de la pasión por el pádel y las ganas de acercar a los
        jugadores de todos los niveles el mejor equipamiento del mercado. Somos
        una tienda especializada en paletas, indumentaria, calzado, accesorios y
        bolsos de las marcas más reconocidas.
      </p>

      <div>
        <h2 className="text-foreground mb-2 text-lg font-semibold">
          Nuestra misión
        </h2>
        <p>
          Queremos que cada jugador encuentre el producto justo para su nivel y
          su forma de jugar, con asesoramiento real y precios claros. Por eso
          seleccionamos cuidadosamente cada marca y cada producto que vendemos.
        </p>
      </div>

      <div>
        <h2 className="text-foreground mb-2 text-lg font-semibold">
          Por qué elegirnos
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Marcas oficiales: Adidas, Nox, Bullpadel, Head y más.</li>
          <li>Atención personalizada por WhatsApp.</li>
          <li>Envíos a todo el país.</li>
          <li>Cuotas sin interés en todos los medios de pago.</li>
        </ul>
      </div>

      <p>
        Si tenés dudas sobre qué paleta o calzado se adapta mejor a tu juego,
        escribinos — te vamos a ayudar a elegir.
      </p>
    </>
  );
}

export default async function NosotrosPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Sobre SF ProPadel
      </h1>

      <div className="text-muted-foreground mt-6 flex flex-col gap-6">
        {settings?.textoNosotros ? (
          <p className="whitespace-pre-line">{settings.textoNosotros}</p>
        ) : (
          <DefaultContent />
        )}
      </div>
    </div>
  );
}
