import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key — bypasses
 * Storage RLS. Only for operations with no user session to act under, like
 * downloading a comprobante to attach to the owner's email: the bucket's
 * SELECT policy is restricted to `authenticated`, and email-sending code
 * (Server Actions, not a browser) has no Supabase session at all.
 *
 * The `server-only` import makes it a build error to pull this into any
 * client component — the service role key must never reach the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
