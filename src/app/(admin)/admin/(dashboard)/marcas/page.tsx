import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { BrandList } from "@/components/admin/brand-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBrandList } from "@/lib/admin-brands";

export const metadata: Metadata = {
  title: "Marcas | SF ProPadel Admin",
};

export default async function AdminMarcasPage() {
  const brands = await getBrandList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Marcas</h1>
        <Button asChild>
          <Link href="/admin/marcas/nueva">
            <Plus className="size-4" />
            Nueva marca
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          <BrandList brands={brands} />
        </CardContent>
      </Card>
    </div>
  );
}
