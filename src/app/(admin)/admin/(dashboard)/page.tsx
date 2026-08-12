import type { Metadata } from "next";
import Link from "next/link";
import { Package, PackageX, Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardStats, getRecentProducts } from "@/lib/admin-dashboard";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard | SF ProPadel Admin",
};

const STATS_CONFIG = [
  {
    key: "activeCount" as const,
    label: "Productos activos",
    icon: Package,
  },
  {
    key: "outOfStockCount" as const,
    label: "Sin stock",
    icon: PackageX,
  },
  {
    key: "onOfferCount" as const,
    label: "En oferta",
    icon: Percent,
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const [stats, recentProducts] = await Promise.all([
    getDashboardStats(),
    getRecentProducts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS_CONFIG.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-semibold tabular-nums">
                  {stats[stat.key]}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimos productos agregados</CardTitle>
          <Link
            href="/admin/productos"
            className="text-primary text-sm hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {recentProducts.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Todavía no hay productos cargados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Agregado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.nombre}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.categoria}
                    </TableCell>
                    <TableCell>{formatCurrency(product.precio)}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Sin stock</Badge>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
