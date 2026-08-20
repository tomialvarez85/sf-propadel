"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Quote, User } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { HomeTestimonial } from "@/lib/home-data";

function TestimonialCard({ testimonial }: { testimonial: HomeTestimonial }) {
  return (
    <div className="bg-primary-foreground/5 flex h-full flex-col gap-4 rounded-xl p-6">
      <Quote className="text-lime size-8 shrink-0" fill="currentColor" />
      <p className="text-primary-foreground flex-1 text-sm leading-relaxed">
        {testimonial.comentario}
      </p>
      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/10 relative size-10 shrink-0 overflow-hidden rounded-full">
          {testimonial.avatarUrl ? (
            <Image
              src={testimonial.avatarUrl}
              alt={testimonial.nombreCliente}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <User className="text-primary-foreground/50 absolute inset-0 m-auto size-5" />
          )}
        </div>
        <span className="text-primary-foreground font-semibold">
          {testimonial.nombreCliente}
        </span>
      </div>
    </div>
  );
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: HomeTestimonial[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-primary-foreground text-2xl font-bold tracking-[-0.015em]">
            Qué dicen de nosotros
          </h2>
          <p className="text-primary-foreground/70 mt-2">
            La opinión de quienes ya juegan con nosotros.
          </p>
        </div>

        <Carousel setApi={setApi} opts={{ align: "start" }} className="mt-10">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {testimonials.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                aria-label={`Ir al testimonio ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "size-2 rounded-full transition-colors duration-150",
                  current === index
                    ? "bg-lime"
                    : "bg-primary-foreground/30 hover:bg-primary-foreground/50",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
