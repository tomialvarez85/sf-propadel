import { redirect } from "next/navigation";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { getCurrentAdminUser } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <aside className="border-border bg-background hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-border border-b px-6 py-4">
          <span className="text-base font-semibold tracking-tight">
            SF <span className="text-primary">ProPadel</span>
          </span>
          <span className="text-muted-foreground ml-1.5 text-sm">Admin</span>
        </div>
        <AdminSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-background flex h-14 items-center justify-between border-b px-4 md:justify-end md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <AdminMobileNav />
            <span className="text-sm font-semibold tracking-tight">
              SF <span className="text-primary">ProPadel</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold">
              {adminUser.nombre.charAt(0).toUpperCase()}
            </span>
            <span className="hidden font-medium sm:inline">
              {adminUser.nombre}
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              · {adminUser.rol}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
