import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Ingresar | SF ProPadel Admin",
};

export default function AdminLoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <Card className="[--card-spacing:24px] w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-[-0.02em]">
            SF <span className="text-primary">ProPadel</span> Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
