"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { finalizeOrder } from "@/app/(site)/actions";
import { ComprobanteUploader } from "@/components/site/comprobante-uploader";
import { CopyField } from "@/components/site/copy-field";
import { Button } from "@/components/ui/button";

type PaymentField = { label: string; value: string };

/** Owns step 2 of checkout: payment info + comprobante upload + "Finalizar
 * compra". The button stays disabled until a comprobante is staged
 * (uploaded to Storage, not yet persisted to the Order) — pressing it is
 * the one moment finalizeOrder runs, persisting the path and firing the
 * owner notification (with the file attached) exactly once. */
export function PedidoCheckoutPanel({
  orderId,
  paymentFields,
  alreadyFinalized,
}: {
  orderId: string;
  paymentFields: PaymentField[];
  alreadyFinalized: boolean;
}) {
  const [comprobantePath, setComprobantePath] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(alreadyFinalized);
  const [isPending, startTransition] = useTransition();

  function handleFinalize() {
    if (!comprobantePath) return;
    startTransition(async () => {
      const result = await finalizeOrder(orderId, comprobantePath);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setFinalized(true);
    });
  }

  if (finalized) {
    return (
      <div className="bg-muted mt-4 flex items-center gap-2 rounded-lg p-3 text-sm">
        <CheckCircle2 className="text-primary size-4 shrink-0" />
        <span>¡Listo! Tu pedido fue confirmado, te contactaremos pronto.</span>
      </div>
    );
  }

  return (
    <>
      {paymentFields.length > 0 && (
        <div className="bg-muted mt-4 flex flex-col gap-1 rounded-lg p-3">
          <p className="text-sm font-semibold">Datos para transferir</p>
          <div className="divide-border divide-y">
            {paymentFields.map((field) => (
              <CopyField key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <ComprobanteUploader orderId={orderId} onUploaded={setComprobantePath} />
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handleFinalize}
        disabled={!comprobantePath || isPending}
        className="mt-4 w-full"
      >
        {isPending ? "Confirmando..." : "Finalizar compra"}
      </Button>
    </>
  );
}
