import { prisma } from "@/lib/prisma";
import type { SiteSettingsFormValues } from "@/lib/validations/site-settings";

const EMPTY_SETTINGS: SiteSettingsFormValues = {
  whatsapp: "",
  instagram: "",
  email: "",
  emailPedidos: "",
  direccion: "",
  horarioAtencion: "",
  textoEnvioGratis: "",
  textoCuotas: "",
  textoNosotros: "",
  alias: "",
  cbu: "",
  titular: "",
  banco: "",
  cantidadCuotas: 12,
  cuotasSinInteres: true,
  descuentoTransferencia: null,
  mostrarPrecioSinImpuestos: false,
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
      email: settings.email ?? "",
      emailPedidos: settings.emailPedidos ?? "",
      direccion: settings.direccion ?? "",
      horarioAtencion: settings.horarioAtencion ?? "",
      textoEnvioGratis: settings.textoEnvioGratis ?? "",
      textoCuotas: settings.textoCuotas ?? "",
      textoNosotros: settings.textoNosotros ?? "",
      alias: settings.alias ?? "",
      cbu: settings.cbu ?? "",
      titular: settings.titular ?? "",
      banco: settings.banco ?? "",
      cantidadCuotas: settings.cantidadCuotas,
      cuotasSinInteres: settings.cuotasSinInteres,
      descuentoTransferencia: settings.descuentoTransferencia,
      mostrarPrecioSinImpuestos: settings.mostrarPrecioSinImpuestos,
    };
  } catch (error) {
    console.error("No se pudo cargar la configuración del sitio:", error);
    return EMPTY_SETTINGS;
  }
}
