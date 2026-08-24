"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProductPrimaryImage } from "@/app/(admin)/admin/(dashboard)/productos/actions";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductImageCell({
  productId,
  productName,
  imageUrl,
  imageCount,
}: {
  productId: string;
  productName: string;
  imageUrl: string | null;
  imageCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [savedImage, setSavedImage] = useState(imageUrl);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function persist(url: string) {
    setError(null);
    setPendingUrl(url);
    startTransition(async () => {
      const result = await updateProductPrimaryImage(productId, url);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSavedImage(url);
      setPendingUrl(null);
      toast.success("Imagen actualizada", { description: productName });
      setOpen(false);
    });
  }

  function handleUploaderChange(url: string | null) {
    // ImageUploader also fires this with `null` from its "Quitar" button —
    // this quick dialog only replaces the primary image, it doesn't support
    // clearing it (a product should always have one). Told explicitly
    // instead of silently ignoring the click, since the uploader reverts to
    // showing `value` again either way (it isn't controlled here).
    if (!url) {
      toast.info("Este acceso rápido solo reemplaza la imagen, no la quita.");
      return;
    }
    persist(url);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Cambiar imagen de ${productName}`}
        className="group relative block size-10 shrink-0 cursor-pointer overflow-hidden rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="bg-muted relative size-10 overflow-hidden rounded-md">
          {savedImage ? (
            <Image
              src={savedImage}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder iconClassName="size-4" />
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
          <Camera className="size-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setError(null);
            setPendingUrl(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Imagen de &quot;{productName}&quot;</DialogTitle>
          </DialogHeader>

          {imageCount > 1 && (
            <p className="text-muted-foreground bg-muted rounded-md p-2 text-xs">
              Este producto tiene {imageCount} imágenes. Este acceso rápido
              solo reemplaza la principal (la primera que se ve en el
              catálogo) — para agregar, reordenar o quitar el resto, entrá a
              &quot;Editar&quot;.
            </p>
          )}

          <div className="relative">
            <ImageUploader
              value={pendingUrl ?? savedImage}
              onChange={handleUploaderChange}
              folder="products"
              recommendedMinSize={{ width: 1200, height: 1200 }}
              cropAspect={1}
              allowBackgroundRemoval
            />
            {isSaving && (
              <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-lg">
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <div className="text-destructive bg-destructive/10 flex items-start gap-2 rounded-md p-2 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-1">
                <span>{error}</span>
                {pendingUrl && (
                  <button
                    type="button"
                    onClick={() => persist(pendingUrl)}
                    className="text-left font-medium underline underline-offset-2"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
