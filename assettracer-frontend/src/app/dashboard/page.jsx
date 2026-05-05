"use client";

// 1. Tambahkan useState dan useEffect
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import axios from "axios";

import ItemsTable from "./itemsTable";
import StockLogTable from "./stockLogTable";
import BorrowLogTable from "./borrowLogTable";
import AddItemDialog from "./AddItemDialog";

export default function DashboardPage() {
  // 2. Siapkan state untuk menampung data role
  const [role, setRole] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(1);

  // 3. Ambil role dari localStorage saat halaman pertama kali dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role);
    }

    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://172.172.255.184:4000/locations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLocations(res.data);
      } catch (error) {
        console.error("Gagal Mengambil Lokasi", error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Represent Pondok Cabe</h1>

        {/* DROPDOWN PEMILIH LOKASI */}
        <select
          className="border border-gray-300 rounded-md p-2 font-medium bg-white"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(Number(e.target.value))}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.address})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="items" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>

              {/* 4. CONDITIONAL RENDERING: Sembunyikan Tab Log jika bukan ADMIN */}
              {role === "ADMIN" && (
                <>
                  <TabsTrigger value="stock">Log Stock</TabsTrigger>
                  <TabsTrigger value="borrow">Log Borrow</TabsTrigger>
                </>
              )}
            </TabsList>

            {/* 5. CONDITIONAL RENDERING: Sembunyikan tombol Tambah jika bukan ADMIN */}
            {role === "ADMIN" && (
              <AddItemDialog locationId={selectedLocation} />
            )}
          </div>

          {/* CONTENT ADA DI DALAM TABS YANG SAMA */}
          <TabsContent value="items">
            <ItemsTable locationId={selectedLocation} />
          </TabsContent>

          {/* 6. CONDITIONAL RENDERING: Sembunyikan konten tabel Log jika bukan ADMIN */}
          {role === "ADMIN" && (
            <>
              <TabsContent value="stock">
                <StockLogTable locationId={selectedLocation} />
              </TabsContent>

              <TabsContent value="borrow">
                <BorrowLogTable locationId={selectedLocation} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
