"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil } from "lucide-react";
import AddItemDialog from "./AddItemDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [openEdit, setOpenEdit] = useState(false);
  const [openStockIn, setOpenStockIn] = useState(false);
  const [openStockOut, setOpenStockOut] = useState(false);
  const [openBorrow, setOpenBorrow] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_unique: false,
  });

  const [stockQty, setStockQty] = useState(1);
  const [stockNote, setStockNote] = useState("");

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowNote, setBorrowNote] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ========================
  // ✅ FETCH ITEMS
  // ========================
  const fetchItems = async (token) => {
    try {
      const res = await axios.get("http://localhost:4000/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchItems(token);
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading items...</p>;
  }

  // ========================
  // ✅ HANDLERS
  // ========================
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      description: item.description,
      is_unique: item.is_unique,
    });
    setOpenEdit(true);
  };

  const handleOpenStockIn = (item) => {
    setSelectedItem(item);
    setStockQty(1);
    setStockNote("");
    setOpenStockIn(true);
  };

  const handleOpenStockOut = (item) => {
    setSelectedItem(item);
    setStockQty(1);
    setStockNote("");
    setOpenStockOut(true);
  };

  const handleOpenBorrow = (item) => {
    setSelectedItem(item);
    setBorrowerName("");
    setBorrowNote("");
    setOpenBorrow(true);
  };

  const handleReturnBorrow = (item) => {
    setOpenBorrow(false);
  };

  // ========================
  // ✅ API ACTIONS
  // ========================
  const handleUpdateItem = async () => {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:4000/items/${selectedItem.id}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems(token);
    setOpenEdit(false);
  };

  const handleStockIn = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:4000/items/stock-in/${selectedItem.id}`,
      { amount: stockQty, note: stockNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchItems(token);
    setOpenStockIn(false);
  };

  const handleStockOut = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:4000/items/stock-out/${selectedItem.id}`,
      { amount: stockQty, note: stockNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchItems(token);
    setOpenStockOut(false);
  };

  const handleBorrow = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:4000/items/${selectedItem.id}/borrow`,
      { borrower_name: borrowerName, note: borrowNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchItems(token);
    setOpenBorrow(false);
  };

  const handleReturn = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:4000/items/${itemId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchItems(token);
    } catch (err) {
      console.error("Return error:", err);
      alert("Gagal return item");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Hapus item ini?")) return;

    await axios.delete(`http://localhost:4000/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchItems(token);
  };

  // ========================
  // ✅ UI
  // ========================
  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nama</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="group hover:bg-gray-50">
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.description}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 flex gap-2 justify-center">
                  <div className="flex justify-end gap-2">
                    {/* ✅ STOCK IN → HANYA NON UNIQUE */}
                    {!item.is_unique && (
                      <button
                        onClick={() => handleOpenStockIn(item)}
                        className="group-hover:opacity-100 transition p-1 rounded hover:bg-green-50 text-green-600"
                        title="Stock In"
                      >
                        Stock In
                      </button>
                    )}

                    {/* ✅ STOCK OUT → HANYA NON UNIQUE */}
                    {!item.is_unique && (
                      <button
                        onClick={() => handleOpenStockOut(item)}
                        className="group-hover:opacity-100 transition p-1 rounded hover:bg-yellow-50 text-yellow-700"
                        title="Stock Out"
                      >
                        Stock Out
                      </button>
                    )}

                    {item.is_unique && item.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setOpenBorrow(true);
                        }}
                      >
                        Borrow
                      </Button>
                    )}

                    {item.is_unique && item.status === "borrowed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReturn(item.id)}
                      >
                        Return
                      </Button>
                    )}

                    {/* ✅ TOMBOL EDIT (SIAP UNTUK NANTI) */}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-blue-100 text-blue-600"
                      title="Edit item"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Pencil size={18} />
                    </button>

                    {/* ✅ TOMBOL DELETE */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-100 text-red-600"
                      title="Hapus item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table></table>
        <Pagination className="mt-4">
          <PaginationContent>
            {/* Prev */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>

            {/* Numbering */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                  isActive={p === page}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Ellipsis (opsional kalau page > 5) */}
            {totalPages > 10 && page < totalPages - 2 && <PaginationEllipsis />}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ===================== */}
      {/* ✅ EDIT MODAL */}
      {/* ===================== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          <Label>Nama</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Label>Deskripsi</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Button onClick={handleUpdateItem}>Simpan</Button>
        </DialogContent>
      </Dialog>

      {/* ===================== */}
      {/* ✅ STOCK IN */}
      {/* ===================== */}
      <Dialog open={openStockIn} onOpenChange={setOpenStockIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock In</DialogTitle>
          </DialogHeader>

          <Input
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
          />

          <Input
            placeholder="Catatan"
            value={stockNote}
            onChange={(e) => setStockNote(e.target.value)}
          />

          <Button onClick={handleStockIn}>Submit</Button>
        </DialogContent>
      </Dialog>

      {/* ===================== */}
      {/* ✅ STOCK OUT */}
      {/* ===================== */}
      <Dialog open={openStockOut} onOpenChange={setOpenStockOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Out</DialogTitle>
          </DialogHeader>

          <Input
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
          />

          <Input
            placeholder="Catatan"
            value={stockNote}
            onChange={(e) => setStockNote(e.target.value)}
          />

          <Button onClick={handleStockOut}>Submit</Button>
        </DialogContent>
      </Dialog>

      {/* ===================== */}
      {/* ✅ BORROW */}
      {/* ===================== */}
      <Dialog open={openBorrow} onOpenChange={setOpenBorrow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Item</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Nama Peminjam"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
          />

          <Input
            placeholder="Catatan"
            value={borrowNote}
            onChange={(e) => setBorrowNote(e.target.value)}
          />

          <Button onClick={handleBorrow}>Pinjam</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
