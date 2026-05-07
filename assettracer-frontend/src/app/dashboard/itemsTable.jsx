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

export default function ItemsTable({ locationId }) {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]); // ✅ STATE BARU: Untuk menyimpan daftar lokasi
  const [loading, setLoading] = useState(true);
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
    location_id: 1, // ✅ Menampung data lokasi untuk diedit
  });

  const [stockQty, setStockQty] = useState(1);
  const [stockNote, setStockNote] = useState("");
  const [borrowNote, setBorrowNote] = useState("");

  const [limit, setLimit] = useState(10);
  const [visibleCount, setVisibleCount] = useState(10);
  const currentItems = items.slice(0, visibleCount);

  //handler
  const handleChangeLimit = (newLimit) => {
    setLimit(newLimit);
    setVisibleCount(newLimit);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + limit);
  };

  // ========================
  // ✅ FETCH ITEMS & LOCATIONS
  // ========================
  const fetchItems = async (token, locId) => {
    try {
      const url = locId
        ? `http://172.172.255.184:4000/items?location_id=${locId}`
        : "http://172.172.255.184:4000/items";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (token) => {
    try {
      const res = await axios.get("http://172.172.255.184:4000/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(res.data);
    } catch (err) {
      console.error("Fetch locations error:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchItems(token, locationId);
      fetchLocations(token); // ✅ Panggil data lokasi saat halaman dimuat
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role);
    }
  }, [locationId]);

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
      location_id: item.location_id || 1, // ✅ Memasukkan lokasi saat ini ke dalam form
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
    setBorrowNote("");
    setOpenBorrow(true);
  };

  // ========================
  // ✅ API ACTIONS
  // ========================
  const handleUpdateItem = async () => {
    try {
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
    } catch (error) {
      console.error("Update error:", error);
      alert("Gagal memperbarui data");
    }
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
      { note: borrowNote },
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

    fetchItems(token, locationId);
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
                    {!item.is_unique && role === "ADMIN" && (
                      <button
                        onClick={() => handleOpenStockIn(item)}
                        className="group-hover:opacity-100 transition p-1 rounded hover:bg-green-50 text-green-600"
                        title="Stock In"
                      >
                        Stock In
                      </button>
                    )}

                    {!item.is_unique && role === "ADMIN" && (
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

                    {role === "ADMIN" && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-blue-100 text-blue-600"
                        title="Edit item"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil size={18} />
                      </button>
                    )}

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
        <div className="flex justify-between items-center mt-4 bg-gray-50 border border-gray-200 p-3 rounded-md shadow-sm">
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

      {/* ✅ DIALOG EDIT YANG SUDAH DIPERBARUI */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          <Label>Lokasi / Gudang</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={form.location_id}
            onChange={(e) =>
              setForm({ ...form, location_id: Number(e.target.value) })
            }
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.address ? `(${loc.address})` : ""}
              </option>
            ))}
          </select>

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
