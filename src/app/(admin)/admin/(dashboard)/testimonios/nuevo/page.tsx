import type { Metadata } from "next";

import { TestimonialForm } from "@/components/admin/testimonial-form";

export const metadata: Metadata = {
  title: "Nuevo testimonio | SF ProPadel Admin",
};

export default function NuevoTestimonioPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Nuevo testimonio
      </h1>
      <TestimonialForm mode="create" />
    </div>
  );
}
