"use client";

import { useState } from "react";
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

export default function AddItemDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_unique: false,
    serial_code: "",
    quantity: 1,
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      is_unique: false,
      serial_code: "",
      quantity: 1,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:4000/items/add",
        {
          name: form.name,
          description: form.description,
          is_unique: form.is_unique,
          serial_code: form.is_unique ? form.serial_code : null,
          quantity: form.is_unique ? null : Number(form.quantity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOpen(false);
      resetForm();
      onSuccess && onSuccess(); // refresh table
    } catch (err) {
      console.error("Add item error:", err);
      alert(err?.response?.data?.message || "Failed adding item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-4">
          + Tambah Item
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Item Baru</DialogTitle>
        </DialogHeader>

        {/* NAME */}
        <div>
          <Label>Nama Barang</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: Laptop Asus"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <Label>Deskripsi</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Opsional"
          />
        </div>

        {/* SWITCH UNIQUE */}
        <div className="flex items-center justify-between">
          <Label>Barang Unik?</Label>
          <Switch
            checked={form.is_unique}
            onCheckedChange={(v) => setForm({ ...form, is_unique: v })}
          />
        </div>

        {/* IF UNIQUE → SERIAL CODE */}
        {form.is_unique && (
          <div>
            <Label>Serial Code</Label>
            <Input
              value={form.serial_code}
              onChange={(e) =>
                setForm({ ...form, serial_code: e.target.value })
              }
              placeholder="WAJIB untuk barang unik"
            />
          </div>
        )}

        {/* IF NON-UNIQUE → QUANTITY */}
        {!form.is_unique && (
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full mt-2">
          Simpan
        </Button>
      </DialogContent>
    </Dialog>
  );
}
