import { prisma } from "@/lib/prisma";
import type { SiteSettingsFormValues } from "@/lib/validations/site-settings";

const EMPTY_SETTINGS: SiteSettingsFormValues = {
  whatsapp: "",
  instagram: "",
  facebook: "",
  email: "",
  direccion: "",
  textoEnvioGratis: "",
  textoCuotas: "",
  textoNosotros: "",
};

export async function getSiteSettingsForEdit(): Promise<SiteSettingsFormValues> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) return EMPTY_SETTINGS;

    return {
      whatsapp: settings.whatsapp ?? "",
      instagram: settings.instagram ?? "",
      facebook: settings.facebook ?? "",
      email: settings.email ?? "",
      direccion: settings.direccion ?? "",
      textoEnvioGratis: settings.textoEnvioGratis ?? "",
      textoCuotas: settings.textoCuotas ?? "",
      textoNosotros: settings.textoNosotros ?? "",
    };
  } catch (error) {
    console.error("No se pudo cargar la configuración del sitio:", error);
    return EMPTY_SETTINGS;
  }
}
