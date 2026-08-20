import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { TestimonialList } from "@/components/admin/testimonial-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTestimonialList } from "@/lib/admin-testimonials";

export const metadata: Metadata = {
  title: "Testimonios | SF ProPadel Admin",
};

export default async function AdminTestimoniosPage() {
  const testimonials = await getTestimonialList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Testimonios</h1>
        <Button asChild>
          <Link href="/admin/testimonios/nuevo">
            <Plus className="size-4" />
            Nuevo testimonio
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          <TestimonialList testimonials={testimonials} />
        </CardContent>
      </Card>
    </div>
  );
}
