import type { Metadata } from "next";

import { UsedListing } from "@/components/site/used-listing";

export const metadata: Metadata = {
  title: "Productos Usados | SF ProPadel",
  description:
    "Paletas, indumentaria y accesorios de pádel usados, a buen precio.",
};

export default function UsadosPage() {
  return <UsedListing />;
}
