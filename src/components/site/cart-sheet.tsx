"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createOrder } from "@/app/(site)/actions";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

type Step = "items" | "checkout";

function CartItemsList({
  items,
  removeItem,
  updateQuantity,
  onNavigate,
}: {
  items: ReturnType<typeof useCart>["items"];
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  onNavigate: () => void;
}) {
  return (
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
                  sizes="64px"
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
                  onClick={onNavigate}
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
  );
}

function CheckoutForm({
  items,
  totalPrice,
  onBack,
  onOrderCreated,
}: {
  items: ReturnType<typeof useCart>["items"];
  totalPrice: number;
  onBack: () => void;
  onOrderCreated: (orderId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { nombre: "", email: "", telefono: "" },
  });

  function onSubmit(values: CheckoutFormValues) {
    startTransition(async () => {
      const result = await createOrder({
        nombre: values.nombre,
        email: values.email,
        telefono: values.telefono,
        items: items.map((item) => ({
          productId: item.productId,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.quantity,
          variantes: item.variants,
          // Falls back to NUEVO for carts saved in localStorage before this
          // field existed — the safe default, since most of the catalog is.
          condicion: item.condicion ?? "NUEVO",
        })),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onOrderCreated(result.orderId);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <p className="text-muted-foreground text-sm">
            Dejanos tus datos para confirmar el pedido — te contactamos para
            coordinar el pago y la entrega.
          </p>

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Teléfono <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="351 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SheetFooter className="border-border border-t">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <span className="font-heading text-lg font-extrabold">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="font-heading h-12 w-full text-base font-bold"
          >
            {isPending ? "Creando pedido..." : "Continuar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onBack}
          >
            Volver al carrito
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("items");
  const router = useRouter();
  const { items, hydrated, removeItem, updateQuantity, totalItems, totalPrice, clearCart } =
    useCart();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset for next time the sheet opens, after the close animation.
      setTimeout(() => setStep("items"), 200);
    }
  }

  function handleOrderCreated(orderId: string) {
    // Order 1 (contact details) is done — payment + comprobante now happen
    // on /pedido/[orderId], the only place the owner email actually fires.
    clearCart();
    setOpen(false);
    router.push(`/pedido/${orderId}`);
  }

  const title = step === "checkout" ? "Tus datos" : "Carrito";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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
          <SheetTitle>{title}</SheetTitle>
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
        ) : step === "checkout" ? (
          <CheckoutForm
            items={items}
            totalPrice={totalPrice}
            onBack={() => setStep("items")}
            onOrderCreated={handleOrderCreated}
          />
        ) : (
          <>
            <CartItemsList
              items={items}
              removeItem={removeItem}
              updateQuantity={updateQuantity}
              onNavigate={() => setOpen(false)}
            />

            <SheetFooter className="border-border border-t">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total</span>
                <span className="font-heading text-lg font-extrabold">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <Button
                type="button"
                size="lg"
                onClick={() => setStep("checkout")}
                className="font-heading h-12 w-full text-base font-bold"
              >
                Finalizar pedido
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
