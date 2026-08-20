"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { saveComprobante } from "@/app/(site)/actions";
import { Button } from "@/components/ui/button";
import { uploadComprobante } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

function formatUploadedAt(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/** Comprobante uploader shared by the checkout confirmation screen
 * (cart-sheet.tsx) and /pedido/[orderId] — same upload flow either way,
 * since both are just different entry points into "attach a comprobante to
 * this order". Upload is always optional: closing without uploading is
 * fine, /pedido/[orderId] exists precisely so it can be done later. */
export function ComprobanteUploader({
  orderId,
  uploadedAt: initialUploadedAt,
}: {
  orderId: string;
  uploadedAt: Date | null;
}) {
  const [uploadedAt, setUploadedAt] = useState(initialUploadedAt);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const path = await uploadComprobante(file, orderId);
      const result = await saveComprobante(orderId, path);
      if (!result.success) throw new Error(result.error);
      setUploadedAt(new Date());
      toast.success("Comprobante subido correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo subir el comprobante.",
      );
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFile(file);
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="bg-muted mt-4 flex flex-col gap-2 rounded-lg p-3">
      <p className="text-sm font-semibold">Comprobante de pago</p>

      {uploadedAt ? (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="text-primary size-4 shrink-0" />
          <span className="text-muted-foreground">
            Subido el {formatUploadedAt(uploadedAt)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Subiendo..." : "Subir otro"}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "border-border flex flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors",
            dragOver && "border-primary bg-background",
          )}
        >
          <Upload className="text-muted-foreground size-5" />
          <p className="text-muted-foreground text-xs">
            Subí tu comprobante (imagen o PDF, máx. 5MB) — arrastralo acá o
            elegilo de tu dispositivo. Es opcional, podés hacerlo más tarde.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Elegir archivo"
            )}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        hidden
        onChange={onInputChange}
      />
    </div>
  );
}
