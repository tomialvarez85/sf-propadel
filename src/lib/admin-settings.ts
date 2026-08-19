import { prisma } from "@/lib/prisma";
import type { SiteSettingsFormValues } from "@/lib/validations/site-settings";

const EMPTY_SETTINGS: SiteSettingsFormValues = {
  whatsapp: "",
  instagram: "",
  facebook: "",
  email: "",
  emailPedidos: "",
  direccion: "",
  horarioAtencion: "",
  textoEnvioGratis: "",
  textoCuotas: "",
  textoNosotros: "",
  imagenGeneroHombre: null,
  imagenGeneroMujer: null,
  alias: "",
  cbu: "",
  titular: "",
  banco: "",
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
      emailPedidos: settings.emailPedidos ?? "",
      direccion: settings.direccion ?? "",
      horarioAtencion: settings.horarioAtencion ?? "",
      textoEnvioGratis: settings.textoEnvioGratis ?? "",
      textoCuotas: settings.textoCuotas ?? "",
      textoNosotros: settings.textoNosotros ?? "",
      imagenGeneroHombre: settings.imagenGeneroHombre,
      imagenGeneroMujer: settings.imagenGeneroMujer,
      alias: settings.alias ?? "",
      cbu: settings.cbu ?? "",
      titular: settings.titular ?? "",
      banco: settings.banco ?? "",
    };
  } catch (error) {
    console.error("No se pudo cargar la configuración del sitio:", error);
    return EMPTY_SETTINGS;
  }
}
