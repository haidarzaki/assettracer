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

  //handler
  const handleChangeLimit = (newLimit) => {
    setLimit(newLimit);
    setVisibleCount(newLimit);
  };

  //handler "load more"
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + limit);
  };

  // Fetch items
  const fetchItemsMap = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://172.172.255.184:4000/items", {
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

  // Fetch logs
  const fetchBorrowLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://172.172.255.184:4000/items/borrow", {
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
    fetchBorrowLogs();
  }, []);

  const headers = [
    "Nama Item",
    "Peminjam",
    "Tgl Pinjam",
    "Tgl Kembali",
    "Note",
  ];

  return (
    <div className="rounded-md border p-4 space-y-4">
      {/* ================== TABLE ================== */}
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
                  <TableCell>{row.borrower_name}</TableCell>
                  <TableCell>
                    {new Date(row.borrow_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {row.return_date ? (
                      new Date(row.return_date).toLocaleString()
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Belum dikembalikan
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{row.note}</TableCell>
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

      {/* pagination */}
      <div className="flex justify-between items-center mt-4 bg-gray-50 border border-gray-200 p-3 rounded-md shadow-sm">
        {/* Bagian Kiri: Pilihan Batas Data */}
        <div className="flex gap-2 items-center">
          {[20, 100, 500].map((num) => (
            <button
              key={num}
              onClick={() => handleChangeLimit(num)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                limit === num
                  ? "bg-white border border-gray-300 text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Bagian Kanan: Tombol Load More */}
        {visibleCount < items.length && (
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
