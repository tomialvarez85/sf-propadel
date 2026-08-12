import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-primary text-sm font-semibold">Error 404</span>
      <h1 className="text-3xl font-semibold tracking-tight">
        No encontramos esta página
      </h1>
      <Link href="/" className="text-primary underline underline-offset-4">
        Volver al inicio
      </Link>
    </div>
  );
}
