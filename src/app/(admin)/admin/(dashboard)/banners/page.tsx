import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { BannerList } from "@/components/admin/banner-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBannerList } from "@/lib/admin-banners";

export const metadata: Metadata = {
  title: "Banners | SF ProPadel Admin",
};

export default async function AdminBannersPage() {
  const banners = await getBannerList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Banners</h1>
        <Button asChild>
          <Link href="/admin/banners/nuevo">
            <Plus className="size-4" />
            Nuevo banner
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          <BannerList banners={banners} />
        </CardContent>
      </Card>
    </div>
  );
}
