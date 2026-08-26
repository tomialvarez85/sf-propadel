import { NextRequest, NextResponse } from "next/server";

// Endpoint temporal solo para confirmar que Telegram llega al servidor.
// La lógica real (auth de usuarios autorizados, parseo de movimientos,
// escritura en la base) se agrega en un paso siguiente.
export async function POST(req: NextRequest) {
  const update = await req.json();
  console.log("[telegram webhook] update recibido:", JSON.stringify(update, null, 2));
  return NextResponse.json({ ok: true });
}
