"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Click-a-thumbnail-to-replace-it dialog, for entities with a single scalar
 * image field (category imagen, brand logo, testimonial avatarUrl) — no
 * gallery, no "primary among several" concept, unlike products' `ProductImageCell`.
 */
export function InlineImageCell({
  label,
  imageUrl,
  onSave,
  folder,
  cropAspect,
  recommendedMinSize,
  fit = "cover",
  thumbnailClassName = "size-10",
  successMessage = "Imagen actualizada",
}: {
  /** Dialog title context and toast description (e.g. category/brand/testimonial name). */
  label: string;
  imageUrl: string | null;
  onSave: (url: string) => Promise<{ success: boolean; error?: string }>;
  folder: string;
  cropAspect?: number;
  recommendedMinSize?: { width: number; height: number };
  fit?: "cover" | "contain";
  thumbnailClassName?: string;
  successMessage?: string;
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
      const result = await onSave(url);
      if (!result.success) {
        setError(result.error ?? "No se pudo guardar la imagen.");
        return;
      }
      setSavedImage(url);
      setPendingUrl(null);
      toast.success(successMessage, { description: label });
      setOpen(false);
    });
  }

  function handleUploaderChange(url: string | null) {
    // "Quitar" fires this with null — this quick dialog only replaces the
    // image, so that's a no-op beyond telling the admin why nothing happened.
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
        aria-label={`Cambiar imagen de ${label}`}
        className={cn(
          "group relative block shrink-0 cursor-pointer overflow-hidden rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          thumbnailClassName,
        )}
      >
        <div className="bg-muted relative size-full overflow-hidden rounded-md">
          {savedImage ? (
            <Image
              src={savedImage}
              alt=""
              fill
              sizes="64px"
              className={fit === "contain" ? "object-contain" : "object-cover"}
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
            <DialogTitle>Imagen de &quot;{label}&quot;</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <ImageUploader
              value={pendingUrl ?? savedImage}
              onChange={handleUploaderChange}
              folder={folder}
              recommendedMinSize={recommendedMinSize}
              cropAspect={cropAspect}
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
