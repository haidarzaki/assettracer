"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddItemDialog({ onSuccess, locationId }) {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);

  // State Form Item
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_unique: false,
    serial_code: "",
    quantity: 1,
    location_id: locationId || 1, // Default ngikutin global filter
  });

  // State Khusus Form Lokasi Baru
  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });

  // Otomatis fetch lokasi setiap kali dialog dibuka
  useEffect(() => {
    if (open) {
      fetchLocations();
      // Reset state form
      setForm((prev) => ({ ...prev, location_id: locationId || 1 }));
      setIsAddingNewLocation(false);
      setNewLocation({ name: "", address: "" });
    }
  }, [open, locationId]);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://172.172.255.184:4000/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(res.data);
    } catch (error) {
      console.error("Fetch locations error:", error);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      is_unique: false,
      serial_code: "",
      quantity: 1,
      location_id: locationId || 1,
    });
    setIsAddingNewLocation(false);
    setNewLocation({ name: "", address: "" });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      let finalLocationId = form.location_id;

      // 1. JIKA USER MAU BIKIN LOKASI BARU DULU
      if (isAddingNewLocation) {
        if (!newLocation.name) {
          alert("Nama lokasi baru wajib diisi!");
          return;
        }
        const locRes = await axios.post(
          "http://172.172.255.184:4000/locations/add",
          { name: newLocation.name, address: newLocation.address },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // Ambil ID lokasi yang baru dibikin dari balasan Backend
        finalLocationId = locRes.data.data.id;
      }

      // 2. TEMBAK API BIKIN BARANG
      await axios.post(
        "http://172.172.255.184:4000/items/add",
        {
          name: form.name,
          description: form.description,
          is_unique: form.is_unique,
          serial_code: form.is_unique ? form.serial_code : null,
          quantity: form.is_unique ? null : Number(form.quantity),
          location_id: finalLocationId, // Pakai ID final
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOpen(false);
      resetForm();
      onSuccess && onSuccess(); // Refresh tabel

      // Kasih alert sukses biar afdol
      alert(
        isAddingNewLocation
          ? "Lokasi & Barang berhasil ditambahkan!"
          : "Barang berhasil ditambahkan!",
      );

      // Reload halaman buat merefresh dropdown filter global (Opsional)
      if (isAddingNewLocation) window.location.reload();
    } catch (err) {
      console.error("Add error:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan data!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-4">
          + Tambah Item
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Item Baru</DialogTitle>
        </DialogHeader>

        {/* PILIH LOKASI MENGGUNAKAN SHADCN */}
        <div className="space-y-2 mb-2 p-3 border rounded-md bg-gray-50">
          <Label className="font-semibold text-blue-600">
            Lokasi Penempatan Barang
          </Label>
          <Select
            value={isAddingNewLocation ? "NEW" : form.location_id.toString()}
            onValueChange={(val) => {
              if (val === "NEW") {
                setIsAddingNewLocation(true);
              } else {
                setIsAddingNewLocation(false);
                setForm({ ...form, location_id: Number(val) });
              }
            }}
          >
            <SelectTrigger className="w-full bg-white border-gray-300">
              <SelectValue placeholder="Pilih Lokasi" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  {loc.name} {loc.address ? `(${loc.address})` : ""}
                </SelectItem>
              ))}
              <SelectItem value="NEW" className="font-bold text-blue-600">
                ➕ Tambah Lokasi Baru...
              </SelectItem>
            </SelectContent>
          </Select>

          {/* MUNCUL KALAU PILIH LOKASI BARU */}
          {isAddingNewLocation && (
            <div className="mt-4 p-3 border-l-4 border-blue-500 bg-white space-y-3">
              <div className="space-y-1">
                <Label>Nama Gudang / Lokasi Baru</Label>
                <Input
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, name: e.target.value })
                  }
                  placeholder="Contoh: Gudang Surabaya"
                />
              </div>
              <div className="space-y-1">
                <Label>Alamat (Opsional)</Label>
                <Input
                  value={newLocation.address}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, address: e.target.value })
                  }
                  placeholder="Contoh: Jl. Pahlawan No. 1"
                />
              </div>
            </div>
          )}
        </div>

        {/* NAME */}
        <div className="space-y-2 mt-2">
          <Label>Nama Barang</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: Laptop Asus"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Label>Deskripsi</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Opsional"
          />
        </div>

        {/* SWITCH UNIQUE */}
        <div className="flex items-center justify-between pt-2">
          <Label>Barang Unik (Ada Serial Number)?</Label>
          <Switch
            checked={form.is_unique}
            onCheckedChange={(v) => setForm({ ...form, is_unique: v })}
          />
        </div>

        {/* IF UNIQUE → SERIAL CODE */}
        {form.is_unique && (
          <div className="space-y-2">
            <Label>Serial Code / SN</Label>
            <Input
              value={form.serial_code}
              onChange={(e) =>
                setForm({ ...form, serial_code: e.target.value })
              }
              placeholder="Wajib untuk barang unik"
            />
          </div>
        )}

        {/* IF NON-UNIQUE → QUANTITY */}
        {!form.is_unique && (
          <div className="space-y-2">
            <Label>Quantity (Jumlah)</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full mt-4">
          Simpan Data
        </Button>
      </DialogContent>
    </Dialog>
  );
}
