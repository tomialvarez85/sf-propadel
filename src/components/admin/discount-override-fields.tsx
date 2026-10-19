"use client";

import type { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type DescuentosGenerales = {
  transferencia: number | null;
  efectivo: number | null;
};

function describeGeneral(percent: number | null) {
  return percent && percent > 0 ? `${percent}%` : "sin descuento";
}

/**
 * Shared by ProductForm and UsedProductForm — both schemas carry the same
 * two optional override fields. Empty input maps to null ("inherit the
 * global"), which is a different thing from 0 ("no discount for this
 * product"), so the onChange keeps them apart.
 */
export function DiscountOverrideFields<T extends FieldValues>({
  control,
  generales,
  usado = false,
}: {
  control: Control<T>;
  // Not needed for usados: the global discounts never apply to them.
  generales?: DescuentosGenerales;
  usado?: boolean;
}) {
  const fields = [
    {
      name: "descuentoTransferenciaOverride",
      label: "Descuento por transferencia (%)",
      general: generales?.transferencia ?? null,
    },
    {
      name: "descuentoEfectivoOverride",
      label: "Descuento en efectivo en el local (%)",
      general: generales?.efectivo ?? null,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, general }) => (
          <FormField
            key={name}
            control={control}
            name={name as Path<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={
                      usado
                        ? "Dejar vacío para no aplicar descuento"
                        : `Dejar vacío para usar el descuento general (${describeGeneral(general)})`
                    }
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? null
                          : event.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        {usado
          ? "Los descuentos generales no se aplican a usados: solo se muestra un descuento si lo cargás acá."
          : "0 = este producto sin descuento, aunque haya uno general."}
      </p>
    </div>
  );
}
