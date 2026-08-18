"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/format";
import type { SiteSettingsData } from "@/lib/site-data";

function buildWhatsappMessage(
  items: ReturnType<typeof useCart>["items"],
  totalPrice: number,
) {
  const lines = items.map((item) => {
    const variantText =
      item.variants.length > 0
        ? ` (${item.variants.map((v) => `${v.tipo}: ${v.valor}`).join(", ")})`
        : "";
    return `- ${item.nombre}${variantText} x${item.quantity} - ${formatCurrency(item.precio * item.quantity)}`;
  });
  return [
    "Hola! Quiero comprar:",
    ...lines,
    `Total: ${formatCurrency(totalPrice)}`,
  ].join("\n");
}

export function CartSheet({ settings }: { settings: SiteSettingsData }) {
  const [open, setOpen] = useState(false);
  const {
    items,
    hydrated,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  const whatsappHref =
    settings?.whatsapp && items.length > 0
      ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(buildWhatsappMessage(items, totalPrice))}`
      : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Carrito"
          className="relative size-11 md:size-8"
        >
          <ShoppingBag className="size-5" />
          {hydrated && totalItems > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0">
        <SheetHeader className="border-border border-b">
          <SheetTitle>Carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-muted-foreground text-sm">
              Tu carrito está vacío.
            </p>
            <Link
              href="/productos"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.lineId} className="flex gap-3">
                    <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
                      {item.imagen ? (
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/productos/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="hover:text-primary line-clamp-2 text-sm font-medium transition-colors"
                        >
                          {item.nombre}
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Quitar del carrito"
                          onClick={() => removeItem(item.lineId)}
                          className="size-9 shrink-0"
                        >
                          <Trash2 className="text-muted-foreground size-4" />
                        </Button>
                      </div>

                      {item.variants.length > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {item.variants.map((v) => v.valor).join(" / ")}
                        </span>
                      )}

                      <div className="mt-1 flex items-end justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            aria-label="Restar cantidad"
                            className="size-8"
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity - 1)
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            aria-label="Sumar cantidad"
                            className="size-8"
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity + 1)
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(item.precio * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-muted-foreground text-xs">
                              {formatCurrency(item.precio)} c/u
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-border border-t">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total</span>
                <span className="font-heading text-lg font-extrabold">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              {whatsappHref ? (
                <Button
                  asChild
                  size="lg"
                  className="font-heading h-12 w-full text-base font-bold"
                >
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    Finalizar por WhatsApp
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="font-heading h-12 w-full text-base font-bold"
                >
                  Finalizar por WhatsApp
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
