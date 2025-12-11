"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";

export default function LogBorrowPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/items/borrow", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "item_id", header: "Item ID" },
    { accessorKey: "borrower_name", header: "Peminjam" },
    {
      accessorKey: "borrow_date",
      header: "Tanggal Pinjam",
      cell: ({ row }) => new Date(row.getValue("borrow_date")).toLocaleString(),
    },
    {
      accessorKey: "return_date",
      header: "Tanggal Kembali",
      cell: ({ row }) =>
        row.getValue("return_date") ? (
          new Date(row.getValue("return_date")).toLocaleString()
        ) : (
          <span className="text-red-600 font-semibold">Belum kembali</span>
        ),
    },
    { accessorKey: "note", header: "Catatan" },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p className="p-10">Loading log borrow...</p>;

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-6">Log Peminjaman</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
