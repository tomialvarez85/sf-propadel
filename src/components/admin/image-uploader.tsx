"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import {
  ImageIcon,
  Info,
  Loader2,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { uploadImage } from "@/lib/supabase/storage";

import "react-image-crop/dist/ReactCrop.css";

type Dimensions = { width: number; height: number };

function getImageDimensions(file: File): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer las dimensiones de la imagen"));
    };
    img.src = url;
  });
}

function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("No se pudo recortar la imagen")),
      "image/png",
    );
  });
}

/** Composites a (presumably transparent-background) image over solid white
 * — the background-removal model outputs a transparent PNG, but the
 * product grid's own container is already white, so a transparent cutout
 * would just show whatever sits behind it there instead of a clean,
 * consistent white card. */
function compositeOnWhite(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    createImageBitmap(blob)
      .then((bitmap) => {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          reject(new Error("No se pudo componer la imagen"));
          return;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("No se pudo componer la imagen")),
          "image/png",
        );
      })
      .catch(reject);
  });
}

function PhotoGuidePopover() {
  const tips = [
    {
      icon: ImageIcon,
      title: "Fondo blanco o neutro liso",
      text: "Evitá fondos con dibujos, muebles o desorden detrás del producto.",
    },
    {
      icon: Sun,
      title: "Buena luz natural, sin sombras duras",
      text: "Sacá la foto cerca de una ventana, de día, sin flash directo.",
    },
    {
      icon: ImageIcon,
      title: "Producto centrado y grande",
      text: "Que ocupe la mayor parte del encuadre, sin recortarse los bordes.",
    },
    {
      icon: ImageIcon,
      title: "Mismo ángulo entre productos similares",
      text: "Ej: todas las paletas de frente, todas las zapatillas de perfil.",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm">
          <Info className="text-muted-foreground size-4" />
          <span className="sr-only">Guía de fotos de producto</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="font-heading mb-3 text-sm font-medium">
          Cómo sacar buenas fotos de producto
        </p>

        {/* Visual reference, not just text tips — a plain product shape,
            centered, on a clean neutral ground with a soft even shadow.
            The better the contrast between product and background here,
            the better the automatic background removal result later. */}
        <svg
          viewBox="0 0 280 160"
          className="border-border mb-3 w-full rounded-lg border"
          aria-label="Ejemplo de foto ideal: producto centrado sobre fondo neutro liso"
        >
          <rect width="280" height="160" fill="oklch(0.97 0.002 213)" />
          <ellipse cx="140" cy="126" rx="46" ry="8" fill="oklch(0.145 0 0 / 0.08)" />
          <g fill="none" stroke="oklch(0.556 0 0)" strokeWidth="3">
            <ellipse cx="140" cy="76" rx="34" ry="42" />
            <line x1="140" y1="118" x2="140" y2="140" strokeWidth="6" strokeLinecap="round" />
          </g>
        </svg>
        <p className="text-muted-foreground -mt-2 mb-3 text-xs">
          Producto solo, centrado, fondo liso — así rinde mejor la remoción
          automática de fondo.
        </p>

        <div className="flex flex-col gap-3">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.title} className="flex items-start gap-2.5">
                <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon className="text-primary size-3.5" />
                </span>
                <span className="flex flex-col text-sm">
                  <span className="font-medium">{tip.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {tip.text}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ReviewState = {
  originalBlob: Blob;
  originalUrl: string;
  processedBlob: Blob;
  processedUrl: string;
};

export function ImageUploader({
  value,
  onChange,
  folder,
  recommendedMinSize,
  cropAspect,
  allowBackgroundRemoval = false,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  /** Soft, non-blocking resolution check — warns but never prevents the upload. */
  recommendedMinSize?: Dimensions;
  /**
   * When set, every upload goes through a mandatory crop step locked to this
   * aspect ratio (e.g. 1 for square product photos) before it's saved —
   * catalog images stay visually consistent regardless of the source
   * file's original framing. Omitted entirely for non-product uploaders
   * (banners, categories, brands) that need their own aspect ratios.
   */
  cropAspect?: number;
  /**
   * Turns on automatic background removal for this uploader, composited
   * onto solid white — the default for product photos (mostly standalone
   * objects: paletas, bolsos, accesorios). The crop dialog shows a
   * "Mantener fondo original" checkbox to opt out per-photo, for
   * indumentaria puesta en modelos where background removal doesn't make
   * sense.
   */
  allowBackgroundRemoval?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [lowResWarning, setLowResWarning] = useState<{
    blob: Blob;
    detected: Dimensions;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [keepOriginalBackground, setKeepOriginalBackground] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [bgProgress, setBgProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [review, setReview] = useState<ReviewState | null>(null);

  function resetCropState() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setKeepOriginalBackground(false);
  }

  function resetReview() {
    if (review) {
      URL.revokeObjectURL(review.originalUrl);
      URL.revokeObjectURL(review.processedUrl);
    }
    setReview(null);
  }

  async function finishUpload(blob: Blob) {
    setUploading(true);
    try {
      const file = new File([blob], `${folder}-${Date.now()}.png`, {
        type: "image/png",
      });
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  async function uploadWithOptionalSizeCheck(blob: Blob) {
    if (recommendedMinSize) {
      try {
        const bitmap = await createImageBitmap(blob);
        const detected = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        if (
          detected.width < recommendedMinSize.width ||
          detected.height < recommendedMinSize.height
        ) {
          setLowResWarning({ blob, detected });
          return;
        }
      } catch {
        // Couldn't read dimensions — don't block the upload over a check
        // that itself failed.
      }
    }
    await finishUpload(blob);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!cropAspect) {
      // No forced framing for this uploader (banners/categories/etc.) —
      // keep the original direct-upload behavior.
      if (recommendedMinSize) {
        try {
          const detected = await getImageDimensions(file);
          if (
            detected.width < recommendedMinSize.width ||
            detected.height < recommendedMinSize.height
          ) {
            setLowResWarning({ blob: file, detected });
            return;
          }
        } catch {
          // ignore, fall through to upload
        }
      }
      await finishUpload(file);
      return;
    }

    setCropSrc(URL.createObjectURL(file));
  }

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    if (!cropAspect) return;
    const { width, height } = event.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, cropAspect, width, height),
      width,
      height,
    );
    setCrop(initialCrop);
    setCompletedCrop({
      unit: "px",
      x: (initialCrop.x / 100) * width,
      y: (initialCrop.y / 100) * height,
      width: (initialCrop.width / 100) * width,
      height: (initialCrop.height / 100) * height,
    });
  }

  async function runBackgroundRemoval(croppedBlob: Blob) {
    setRemovingBackground(true);
    setBgProgress(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const cutout = await removeBackground(croppedBlob, {
        progress: (_key, current, total) => setBgProgress({ current, total }),
      });
      const processedBlob = await compositeOnWhite(cutout);
      resetCropState();
      setReview({
        originalBlob: croppedBlob,
        originalUrl: URL.createObjectURL(croppedBlob),
        processedBlob,
        processedUrl: URL.createObjectURL(processedBlob),
      });
    } catch {
      toast.error(
        "No se pudo quitar el fondo automáticamente. Se sube la foto tal cual.",
      );
      resetCropState();
      await uploadWithOptionalSizeCheck(croppedBlob);
    } finally {
      setRemovingBackground(false);
      setBgProgress(null);
    }
  }

  async function handleConfirmCrop() {
    if (!imageRef.current || !completedCrop) return;
    try {
      const blob = await getCroppedBlob(imageRef.current, completedCrop);
      if (allowBackgroundRemoval && !keepOriginalBackground) {
        await runBackgroundRemoval(blob);
        return;
      }
      resetCropState();
      await uploadWithOptionalSizeCheck(blob);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo recortar la imagen",
      );
    }
  }

  async function confirmReview(useProcessed: boolean) {
    if (!review) return;
    const chosen = useProcessed ? review.processedBlob : review.originalBlob;
    resetReview();
    await uploadWithOptionalSizeCheck(chosen);
  }

  function confirmLowResUpload() {
    const pending = lowResWarning;
    setLowResWarning(null);
    if (pending) void finishUpload(pending.blob);
  }

  const bgProgressPercent =
    bgProgress && bgProgress.total > 0
      ? Math.min(100, Math.round((bgProgress.current / bgProgress.total) * 100))
      : null;

  return (
    <div className="flex items-center gap-4">
      <div className="border-border bg-muted relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed">
        {value ? (
          <Image src={value} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <Upload className="text-muted-foreground size-5" />
        )}
        {uploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          {cropAspect && <PhotoGuidePopover />}
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            <X className="size-4" />
            Quitar
          </Button>
        )}
      </div>

      <Dialog
        open={cropSrc !== null}
        onOpenChange={(open) => !open && resetCropState()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recortar imagen</DialogTitle>
          </DialogHeader>

          {cropSrc && (
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                Ajustá el recuadro cuadrado sobre la parte del producto que
                querés mostrar en el catálogo.
              </p>
              <div className="bg-muted flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                  aspect={cropAspect}
                  keepSelection
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- ReactCrop needs a raw <img> ref, next/image doesn't expose one compatibly */}
                  <img
                    ref={imageRef}
                    src={cropSrc}
                    alt=""
                    onLoad={handleImageLoad}
                    className="max-h-[60vh]"
                  />
                </ReactCrop>
              </div>

              {allowBackgroundRemoval && (
                <div className="border-border bg-muted/50 flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="keep-original-bg"
                      checked={keepOriginalBackground}
                      onCheckedChange={(checked) =>
                        setKeepOriginalBackground(checked === true)
                      }
                    />
                    <label htmlFor="keep-original-bg" className="text-sm">
                      Mantener fondo original
                    </label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Por defecto quitamos el fondo automáticamente y lo
                    reemplazamos por blanco sólido — funciona mejor con
                    productos solos (paletas, accesorios, calzado). Activá
                    esto para indumentaria puesta en modelos, donde no se
                    recomienda quitar el fondo.
                  </p>
                  {removingBackground && (
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Loader2 className="size-3.5 animate-spin" />
                      {bgProgressPercent !== null
                        ? `Quitando fondo... ${bgProgressPercent}%`
                        : "Quitando fondo..."}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetCropState}
              disabled={removingBackground}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!completedCrop || uploading || removingBackground}
              onClick={handleConfirmCrop}
            >
              {removingBackground
                ? "Procesando..."
                : uploading
                  ? "Subiendo..."
                  : "Confirmar recorte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={review !== null}
        onOpenChange={(open) => !open && resetReview()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>¿Usar la foto sin fondo?</DialogTitle>
          </DialogHeader>

          {review && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs font-medium">
                    Original
                  </span>
                  <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL, not an optimizable static asset */}
                    <img
                      src={review.originalUrl}
                      alt="Foto original"
                      className="size-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs font-medium">
                    Fondo removido
                  </span>
                  <div className="border-border relative aspect-square overflow-hidden rounded-lg border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL, not an optimizable static asset */}
                    <img
                      src={review.processedUrl}
                      alt="Foto con fondo removido"
                      className="size-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Si el recorte salió mal (bordes muy finos o transparentes,
                como en un protector de borde), mantené la foto original.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => confirmReview(false)}
            >
              Usar foto original
            </Button>
            <Button
              type="button"
              disabled={uploading}
              onClick={() => confirmReview(true)}
            >
              {uploading ? "Subiendo..." : "Usar sin fondo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={lowResWarning !== null}
        onOpenChange={(open) => !open && setLowResWarning(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolución baja</AlertDialogTitle>
            <AlertDialogDescription>
              {lowResWarning && recommendedMinSize && (
                <>
                  Esta imagen es de {lowResWarning.detected.width}×
                  {lowResWarning.detected.height}px. Recomendamos al menos{" "}
                  {recommendedMinSize.width}×{recommendedMinSize.height}px para
                  que se vea nítida en el sitio. Podés subirla igual, pero puede
                  verse borrosa o pixelada en pantallas grandes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Elegir otra imagen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLowResUpload}>
              Subir igual
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
