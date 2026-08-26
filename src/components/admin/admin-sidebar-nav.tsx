"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Receipt,
  Settings,
  Tag,
  Tags,
  Undo2,
} from "lucide-react";

import { LogoutButton } from "@/components/admin/logout-button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/usados", label: "Usados", icon: Undo2 },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Tag },
  { href: "/admin/banners", label: "Banner del home", icon: ImageIcon },
  {
    href: "/admin/testimonios",
    label: "Testimonios",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración del sitio",
    icon: Settings,
  },
];

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col justify-between px-3 py-4">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-border border-t pt-3">
        <LogoutButton />
      </div>
    </nav>
  );
}
