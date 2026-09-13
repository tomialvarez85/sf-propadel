import type { Metadata } from "next";

import { UsedListing } from "@/components/site/used-listing";
import { buildSocialMetadata } from "@/lib/seo";

const TITLE = "Productos Usados | SF ProPadel";
const DESCRIPTION =
  "Paletas, indumentaria y accesorios de pádel usados, revisados y a buen precio.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...buildSocialMetadata({ title: TITLE, description: DESCRIPTION, path: "/usados" }),
};

export default function UsadosPage() {
  return <UsedListing />;
}
