"use client";

import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWishlist } from "@/hooks/use-wishlist";
import type { CategoryNavItem, SiteSettingsData } from "@/lib/site-data";

function WishlistHeaderLink() {
  const { items, hydrated } = useWishlist();

  return (
    <Button variant="ghost" size="icon" aria-label="Favoritos" asChild>
      <Link href="/favoritos" className="relative">
        <Heart className="size-5" />
        {hydrated && items.length > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
            {items.length}
          </span>
        )}
      </Link>
    </Button>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/productos" method="GET" className={className}>
      <div className="relative w-full">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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

function CategoryLink({
  category,
}: {
  category: { slug: string; nombre: string };
}) {
  return (
    <Link
      href={`/${category.slug}`}
      className="hover:text-primary text-sm font-medium transition-colors"
    >
      {category.nombre}
    </Link>
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

  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      {topBarText && (
        <div className="bg-primary text-primary-foreground px-6 py-2 text-center text-xs font-medium">
          {topBarText}
        </div>
      )}

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight whitespace-nowrap"
        >
          SF <span className="text-primary">ProPadel</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((category) =>
            category.children.length > 0 ? (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger className="hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none">
                  {category.nombre}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {category.children.map((child) => (
                    <DropdownMenuItem key={child.id} asChild>
                      <Link href={`/${child.slug}`}>{child.nombre}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <CategoryLink key={category.id} category={category} />
            ),
          )}
        </nav>

        <SearchForm className="ml-auto hidden max-w-xs flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <WishlistHeaderLink />

          <Button variant="ghost" size="icon" aria-label="Carrito">
            <ShoppingCart className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menú">
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {categories.map((category) => (
                <div key={category.id}>
                  <DropdownMenuItem asChild>
                    <Link href={`/${category.slug}`}>{category.nombre}</Link>
                  </DropdownMenuItem>
                  {category.children.map((child) => (
                    <DropdownMenuItem key={child.id} asChild className="pl-6">
                      <Link href={`/${child.slug}`}>{child.nombre}</Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
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
