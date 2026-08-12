"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-foreground w-full justify-start gap-2.5 px-3 text-sm font-medium"
    >
      <LogOut className="size-4 shrink-0" />
      Cerrar sesión
    </Button>
  );
}
