"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Lock, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSheet } from "@/components/site/cart-sheet";
import type { CategoryNavItem, SiteSettingsData } from "@/lib/site-data";

function AdminAccessLink() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Acceso administradores"
      title="Acceso administradores"
      className="size-11 md:size-8"
      asChild
    >
      <Link href="/admin">
        <Lock className="text-foreground size-5" />
      </Link>
    </Button>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/productos" method="GET" className={className}>
      <div className="relative w-full">
        <Search className="text-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          name="q"
          placeholder="Buscar productos..."
          className="pl-9"
        />
      </div>
    </form>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-primary hover:text-primary/70 text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

function ProductsNav({ categories }: { categories: CategoryNavItem[] }) {
  return (
    <div className="flex items-center gap-0.5">
      <NavLink href="/productos">Productos</NavLink>
      {categories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Ver categorías"
            className="text-primary hover:text-primary/70 focus-visible:ring-ring/50 flex items-center rounded-md p-1 outline-none transition-colors focus-visible:ring-3"
          >
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((category) =>
              category.children.length > 0 ? (
                <DropdownMenuSub key={category.id}>
                  <DropdownMenuSubTrigger>
                    {category.nombre}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {category.children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild>
                        <Link href={`/${child.slug}`}>{child.nombre}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/${category.slug}`}>{category.nombre}</Link>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function SiteHeader({
  categories,
  settings,
}: {
  categories: CategoryNavItem[];
  settings: SiteSettingsData;
}) {
  const topBarText = [settings?.textoEnvioGratis, settings?.textoCuotas]
    .filter(Boolean)
    .join(" · ");

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="border-border sticky top-0 z-50 border-b bg-white"
    >
      {topBarText && (
        <div className="bg-lime text-lime-foreground px-6 py-2 text-center text-xs font-medium">
          {topBarText}
        </div>
      )}

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link
          href="/"
          className="focus-visible:ring-ring/50 shrink-0 rounded-md outline-none focus-visible:ring-3"
        >
          {/* PNG chico y fijo: sin optimizar, no gasta transformaciones. */}
          <Image
            src="/logo.png"
            alt="SF ProPadel"
            width={566}
            height={240}
            priority
            unoptimized
            className="h-10 w-auto md:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Home</NavLink>
          <ProductsNav categories={categories} />
          <NavLink href="/nosotros">Nosotros</NavLink>
          <NavLink href="/contacto">Contacto</NavLink>
          <NavLink href="/usados">Usados</NavLink>
        </nav>

        <SearchForm className="ml-auto hidden max-w-xs flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <CartSheet />

          <div aria-hidden className="bg-border mx-1 h-5 w-px" />

          <AdminAccessLink />

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menú"
                className="size-11 md:size-8"
              >
                <Menu className="text-foreground size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/productos">Productos</Link>
              </DropdownMenuItem>
              {categories.map((category) => (
                <div key={category.id}>
                  <DropdownMenuItem asChild className="pl-6">
                    <Link href={`/${category.slug}`}>{category.nombre}</Link>
                  </DropdownMenuItem>
                  {category.children.map((child) => (
                    <DropdownMenuItem
                      key={child.id}
                      asChild
                      className="pl-9"
                    >
                      <Link href={`/${child.slug}`}>{child.nombre}</Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/nosotros">Nosotros</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contacto">Contacto</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/usados">Usados</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 pb-4 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
