"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function StockLogTable() {
  const [data, setData] = useState([]);
  const [itemsMap, setItemsMap] = useState({});

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Fetch items
  const fetchItemsMap = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = await res.json();
      const map = {};
      items.forEach((it) => (map[it.id] = it.name));
      setItemsMap(map);
    } catch (err) {
      console.error("Gagal ambil items:", err);
    }
  };

  // Fetch stock logs
  const fetchStockLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/items/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal ambil stock logs:", err);
    }
  };

  useEffect(() => {
    fetchItemsMap();
    fetchStockLogs();
  }, []);

  const headers = ["Nama Item", "Type", "Qty", "Note", "Tanggal"];

  return (
    <div className="rounded-md border p-4 space-y-4">
      {/* TABLE */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {itemsMap[row.item_id] ?? `#${row.item_id}`}
                  </TableCell>
                  <TableCell className="uppercase">{row.type}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.note}</TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* PREV */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>

            {/* PAGE NUMBER */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* NEXT */}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page === totalPages ? "pointer-events-none opacity-40" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
