import Image from "next/image";

export function BannerPreview({
  imagen,
  titulo,
}: {
  imagen: string | null;
  titulo?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">Vista previa</span>
      <div className="bg-muted relative aspect-[16/5] w-full max-w-xl overflow-hidden rounded-xl">
        {imagen && (
          <Image
            src={imagen}
            alt=""
            fill
            sizes="(min-width: 640px) 576px, 100vw"
            className="object-cover"
          />
        )}
        {titulo && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-xl font-semibold text-white sm:text-3xl">
              {titulo}
            </h2>
          </div>
        )}
        {!imagen && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            Subí una imagen para ver la vista previa
          </div>
        )}
      </div>
    </div>
  );
}
