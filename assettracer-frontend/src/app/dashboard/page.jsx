"use client";

// 1. Tambahkan useState dan useEffect
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import ItemsTable from "./itemsTable";
import StockLogTable from "./stockLogTable";
import BorrowLogTable from "./borrowLogTable";
import AddItemDialog from "./AddItemDialog";

export default function DashboardPage() {
  // 2. Siapkan state untuk menampung data role
  const [role, setRole] = useState(null);

  // 3. Ambil role dari localStorage saat halaman pertama kali dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Represent Pondok Cabe</h1>

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
            {role === "ADMIN" && <AddItemDialog />}
          </div>

          {/* CONTENT ADA DI DALAM TABS YANG SAMA */}
          <TabsContent value="items">
            <ItemsTable />
          </TabsContent>

          {/* 6. CONDITIONAL RENDERING: Sembunyikan konten tabel Log jika bukan ADMIN */}
          {role === "ADMIN" && (
            <>
              <TabsContent value="stock">
                <StockLogTable />
              </TabsContent>

              <TabsContent value="borrow">
                <BorrowLogTable />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
