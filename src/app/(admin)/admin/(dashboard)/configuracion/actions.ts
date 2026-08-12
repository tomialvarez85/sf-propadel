"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema } from "@/lib/validations/site-settings";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateSettingsPaths() {
  // Header/footer live in the (site) layout, shared by every public route.
  revalidatePath("/", "layout");
  revalidatePath("/nosotros");
  revalidatePath("/contacto");
  revalidatePath("/productos/[slug]", "page");
}

function normalizeSettingsData(
  data: ReturnType<typeof siteSettingsSchema.parse>,
) {
  return {
    whatsapp: data.whatsapp || null,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    email: data.email || null,
    direccion: data.direccion || null,
    textoEnvioGratis: data.textoEnvioGratis || null,
    textoCuotas: data.textoCuotas || null,
    textoNosotros: data.textoNosotros || null,
  };
}

export async function updateSiteSettings(
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const data = normalizeSettingsData(parsed.data);
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  } catch (error) {
    console.error("No se pudo guardar la configuración:", error);
    return { success: false, error: "No se pudo guardar la configuración." };
  }

  revalidateSettingsPaths();
  return { success: true };
}
