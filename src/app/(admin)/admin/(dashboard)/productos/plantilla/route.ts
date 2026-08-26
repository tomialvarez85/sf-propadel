import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { IMPORT_COLUMNS, IMPORT_EXAMPLE_ROWS } from "@/lib/product-import";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const headers = IMPORT_COLUMNS.map((column) => column.header);
  const worksheet = XLSX.utils.json_to_sheet(IMPORT_EXAMPLE_ROWS, {
    header: headers,
  });
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + 2, 14),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="plantilla-productos.xlsx"',
    },
  });
}
