import { WhatsappIcon } from "@/components/icons/social";

const DEFAULT_MESSAGE = "Hola! Tengo una consulta sobre productos de SF ProPadel";

export function WhatsappFloatButton({
  whatsapp,
}: {
  whatsapp: string | null | undefined;
}) {
  if (!whatsapp) return null;

  const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="bottom-safe-float fixed right-4 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 motion-safe:hover:scale-105 sm:right-6"
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsappIcon className="size-7" />
    </a>
  );
}
