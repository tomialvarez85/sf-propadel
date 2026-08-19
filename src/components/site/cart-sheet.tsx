"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Check,
  CheckCircle2,
  Copy,
  Minus,
  MessageCircle,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
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
import { useCart, type CartItem } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/format";
import type { SiteSettingsData } from "@/lib/site-data";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

type Step = "items" | "checkout" | "confirmation";

type ConfirmedOrder = {
  email: string;
  items: CartItem[];
  total: number;
};

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
  onSuccess,
}: {
  items: ReturnType<typeof useCart>["items"];
  totalPrice: number;
  onBack: () => void;
  onSuccess: (email: string) => void;
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
        telefono: values.telefono || null,
        items: items.map((item) => ({
          productId: item.productId,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.quantity,
          variantes: item.variants,
        })),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onSuccess(values.email);
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
                <FormLabel>Teléfono (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="11 2233 4455"
                    {...field}
                    value={field.value ?? ""}
                  />
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
            {isPending ? "Confirmando..." : "Confirmar pedido"}
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

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar. Copiá el valor manualmente.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-base font-bold">{value}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <>
            <Check className="text-primary size-3.5" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copiar
          </>
        )}
      </Button>
    </div>
  );
}

function OrderConfirmation({
  order,
  settings,
  onClose,
}: {
  order: ConfirmedOrder;
  settings: SiteSettingsData;
  onClose: () => void;
}) {
  const paymentFields = [
    { label: "Alias", value: settings?.alias },
    { label: "CBU / CVU", value: settings?.cbu },
    { label: "Titular", value: settings?.titular },
    { label: "Banco", value: settings?.banco },
  ].filter((field): field is { label: string; value: string } =>
    Boolean(field.value),
  );

  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola! Te mando el comprobante de mi pedido de ${formatCurrency(order.total)}.`,
      )}`
    : null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <CheckCircle2 className="text-primary size-10" />
        <h3 className="font-heading text-lg font-bold">¡Pedido recibido!</h3>
        <p className="text-muted-foreground text-sm">
          Te vamos a contactar a la brevedad a <strong>{order.email}</strong>{" "}
          para coordinar la entrega.
        </p>
      </div>

      <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
        <p className="text-sm font-semibold">Resumen del pedido</p>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.lineId} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">
                {item.nombre}
                {item.variants.length > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({item.variants.map((v) => v.valor).join(" / ")})
                  </span>
                )}{" "}
                <span className="text-muted-foreground">x{item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium">
                {formatCurrency(item.precio * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold">
          <span>Total</span>
          <span className="font-heading text-lg font-extrabold">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {paymentFields.length > 0 && (
        <div className="bg-muted mt-4 flex flex-col gap-1 rounded-lg p-3">
          <p className="text-sm font-semibold">Datos para transferir</p>
          <div className="divide-border divide-y">
            {paymentFields.map((field) => (
              <CopyField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-muted-foreground mt-4 text-sm">
        Transferí el total y mandanos el comprobante por WhatsApp para
        confirmar tu pedido más rápido.
      </p>

      {whatsappHref && (
        <Button asChild variant="outline" className="mt-3 w-full">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            Enviar comprobante por WhatsApp
          </a>
        </Button>
      )}

      <Button onClick={onClose} className="mt-4 w-full">
        Seguir comprando
      </Button>
    </div>
  );
}

export function CartSheet({ settings }: { settings: SiteSettingsData }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("items");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(
    null,
  );
  const { items, hydrated, removeItem, updateQuantity, totalItems, totalPrice, clearCart } =
    useCart();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset for next time the sheet opens, after the close animation.
      setTimeout(() => setStep("items"), 200);
    }
  }

  function handleOrderSuccess(email: string) {
    // Snapshot before clearing — the confirmation screen still needs to
    // show what was bought after the cart itself goes empty.
    setConfirmedOrder({ email, items, total: totalPrice });
    clearCart();
    setStep("confirmation");
  }

  const title =
    step === "checkout"
      ? "Tus datos"
      : step === "confirmation"
        ? "Pedido confirmado"
        : "Carrito";

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

        {step === "confirmation" && confirmedOrder ? (
          <OrderConfirmation
            order={confirmedOrder}
            settings={settings}
            onClose={() => setOpen(false)}
          />
        ) : items.length === 0 ? (
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
            onSuccess={handleOrderSuccess}
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
