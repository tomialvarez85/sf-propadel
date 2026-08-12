"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/supabase/storage";

export function ImageUploader({
  value,
  onChange,
  folder,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
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

  return (
    <div className="flex items-center gap-4">
      <div className="border-border bg-muted relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed">
        {value ? (
          <Image src={value} alt="" fill className="object-cover" />
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Cambiar imagen" : "Subir imagen"}
        </Button>
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
    </div>
  );
}
