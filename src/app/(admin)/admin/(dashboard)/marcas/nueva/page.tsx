import type { Metadata } from "next";

import { BrandForm } from "@/components/admin/brand-form";

export const metadata: Metadata = {
  title: "Nueva marca | SF ProPadel Admin",
};

export default function NuevaMarcaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva marca</h1>
      <BrandForm mode="create" />
    </div>
  );
}
