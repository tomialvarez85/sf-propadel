import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TestimonialForm } from "@/components/admin/testimonial-form";
import { getTestimonialForEdit } from "@/lib/admin-testimonials";

export const metadata: Metadata = {
  title: "Editar testimonio | SF ProPadel Admin",
};

export default async function EditarTestimonioPage(
  props: PageProps<"/admin/testimonios/[id]/editar">,
) {
  const { id } = await props.params;
  const testimonial = await getTestimonialForEdit(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar testimonio
      </h1>
      <TestimonialForm mode="edit" initialData={testimonial} />
    </div>
  );
}
