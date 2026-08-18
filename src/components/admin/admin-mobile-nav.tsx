"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menú"
          className="size-11 md:size-8"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-border border-b px-6 py-4">
          <SheetTitle>
            SF <span className="text-primary">ProPadel</span>{" "}
            <span className="text-muted-foreground font-normal">Admin</span>
          </SheetTitle>
        </SheetHeader>
        <AdminSidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
