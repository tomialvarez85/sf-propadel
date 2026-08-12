import type { AdminUser } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensures a Prisma AdminUser row exists for the given Supabase user, linked
 * by supabaseUserId. First admin has to be created manually in the Supabase
 * dashboard (email/password) — this just mirrors it into our own table so
 * the rest of the admin panel has nombre/rol without touching Supabase again.
 */
export async function getOrCreateAdminUser(supabaseUser: {
  id: string;
  email?: string;
}): Promise<AdminUser> {
  const existing = await prisma.adminUser.findUnique({
    where: { supabaseUserId: supabaseUser.id },
  });

  if (existing) return existing;

  return prisma.adminUser.create({
    data: {
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email ?? "",
      nombre: supabaseUser.email?.split("@")[0] ?? "Admin",
    },
  });
}

/** Returns the current logged-in AdminUser, or null if there's no session. */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getOrCreateAdminUser(user);
}
