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
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";

export default function ItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ STATE BARU: Untuk menyimpan role dari Local Storage
  const [role, setRole] = useState(null);

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

  const [limit, setLimit] = useState(20);
  const [visibleCount, setVisibleCount] = useState(20);

  //handler
  const handleChangeLimit = (newLimit) => {
    setLimit(newLimit);
    setVisibleCount(newLimit);
  };

  //handler "load more"
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + limit);
  }

  // ========================
  // ✅ FETCH ITEMS
  // ========================
  const fetchItems = async (token) => {
    try {
      const res = await axios.get("http://172.172.255.184:4000/items", {
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
    // 1. Ambil Token
    const token = localStorage.getItem("token");
    if (token) fetchItems(token);

    // 2. Ambil Role (KTP)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role);
    }
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
    await axios.put(
      `http://172.172.255.184:4000/items/${selectedItem.id}`,
      form,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    fetchItems(token);
    setOpenEdit(false);
  };

  const handleStockIn = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://172.172.255.184:4000/items/stock-in/${selectedItem.id}`,
      { amount: stockQty, note: stockNote },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchItems(token);
    setOpenStockIn(false);
  };

  const handleStockOut = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://172.172.255.184:4000/items/stock-out/${selectedItem.id}`,
      { amount: stockQty, note: stockNote },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchItems(token);
    setOpenStockOut(false);
  };

  const handleBorrow = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://172.172.255.184:4000/items/${selectedItem.id}/borrow`,
      { borrower_name: borrowerName, note: borrowNote },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchItems(token);
    setOpenBorrow(false);
  };

  const handleReturn = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://172.172.255.184:4000/items/${itemId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
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

    await axios.delete(`http://172.172.255.184:4000/items/${id}`, {
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
                    {/* ✅ CONDITIONAL: STOCK IN → HANYA NON UNIQUE DAN ADMIN */}
                    {!item.is_unique && role === "ADMIN" && (
                      <button
                        onClick={() => handleOpenStockIn(item)}
                        className="group-hover:opacity-100 transition p-1 rounded hover:bg-green-50 text-green-600"
                        title="Stock In"
                      >
                        Stock In
                      </button>
                    )}

                    {/* ✅ CONDITIONAL: STOCK OUT → HANYA NON UNIQUE DAN ADMIN */}
                    {!item.is_unique && role === "ADMIN" && (
                      <button
                        onClick={() => handleOpenStockOut(item)}
                        className="group-hover:opacity-100 transition p-1 rounded hover:bg-yellow-50 text-yellow-700"
                        title="Stock Out"
                      >
                        Stock Out
                      </button>
                    )}

                    {/* ✅ TOMBOL BORROW (BISA DIAKSES SEMUA ROLE) */}
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

                    {/* ✅ TOMBOL RETURN (BISA DIAKSES SEMUA ROLE) */}
                    {item.is_unique && item.status === "borrowed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReturn(item.id)}
                      >
                        Return
                      </Button>
                    )}

                    {/* ✅ CONDITIONAL: TOMBOL EDIT (HANYA ADMIN) */}
                    {role === "ADMIN" && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-blue-100 text-blue-600"
                        title="Edit item"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil size={18} />
                      </button>
                    )}

                    {/* ✅ CONDITIONAL: TOMBOL DELETE (HANYA ADMIN) */}
                    {role === "ADMIN" && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-100 text-red-600"
                        title="Hapus item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination */}
        {/* ===================== */}
        {/* ✅ CUSTOM PAGINATION (LOAD MORE) */}
        {/* ===================== */}
        <div className="flex justify-between items-center mt-6 bg-gray-900 text-white p-3 rounded-md">
          {/* Bagian Kiri: Pilihan Batas Data */}
          <div className="flex gap-2">
            {[20, 100, 500].map((num) => (
              <button
                key={num}
                onClick={() => handleChangeLimit(num)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  limit === num
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {visibleCount < items.length && (
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialogs tetap utuh di bawah sini */}
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
