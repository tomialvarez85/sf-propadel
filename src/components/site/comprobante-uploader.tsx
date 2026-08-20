"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadComprobante } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

/** Uploads a comprobante straight to Storage and reports the resulting
 * path back via onUploaded — this alone does NOT touch the Order or send
 * any email. The caller (pedido-checkout-panel.tsx) decides what to do
 * with that path: it stays staged until "Finalizar compra" persists it
 * and fires the owner notification, exactly once, in finalizeOrder. */
export function ComprobanteUploader({
  orderId,
  onUploaded,
}: {
  orderId: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const path = await uploadComprobante(file, orderId);
      setUploadedName(file.name);
      onUploaded(path);
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
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Comprobante de pago</p>

      {uploadedName ? (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="text-primary size-4 shrink-0" />
          <span className="text-muted-foreground truncate">{uploadedName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Subiendo..." : "Cambiar archivo"}
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
            elegilo de tu dispositivo.
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
