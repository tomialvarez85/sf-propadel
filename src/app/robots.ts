import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /pedido/[orderId] is a per-customer order page (name + order
      // contents) — see the noindex on that page's own metadata too.
      disallow: ["/admin", "/pedido"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
