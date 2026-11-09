import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";

import { InstagramIcon } from "@/components/icons/social";
import type { SiteSettingsData } from "@/lib/site-data";

const INFO_LINKS = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteFooter({ settings }: { settings: SiteSettingsData }) {
  return (
    <footer className="border-border bg-primary text-primary-foreground border-t">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-heading text-xl font-extrabold tracking-[-0.02em]">
            SFProPadel
          </span>
          <p className="text-primary-foreground/70 text-sm">
            Todo lo que necesitás para jugar al pádel.
          </p>
          <div className="mt-2 flex items-center gap-3">
            {settings?.instagram && (
              <Link
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <InstagramIcon className="size-5" />
              </Link>
            )}
            {settings?.whatsapp && (
              <Link
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="size-5" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">Información</span>
          <nav className="flex flex-col gap-2">
            {INFO_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">Contacto</span>
          <div className="text-primary-foreground/70 flex flex-col gap-2 text-sm">
            {settings?.email && (
              <span className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                {settings.email}
              </span>
            )}
            {settings?.direccion && (
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {settings.direccion}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-primary-foreground/10 text-primary-foreground/60 border-t px-6 py-4 text-center text-xs">
        © {new Date().getFullYear()} SF ProPadel. Todos los derechos reservados.
      </div>
    </footer>
  );
}
