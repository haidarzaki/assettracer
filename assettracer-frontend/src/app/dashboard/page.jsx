"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

import ItemsTable from "./itemsTable";
import StockLogTable from "./stockLogTable";
import BorrowLogTable from "./borrowLogTable";
import AddItemDialog from "./AddItemDialog";

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(1);

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

        {/* ✅ DROPDOWN PEMILIH LOKASI MENGGUNAKAN SHADCN */}
        <Select
          value={selectedLocation.toString()}
          onValueChange={(val) => setSelectedLocation(Number(val))}
        >
          <SelectTrigger className="w-[300px] bg-white font-medium border-gray-300">
            <SelectValue placeholder="Pilih Lokasi" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id.toString()}>
                {loc.name} {loc.address ? `(${loc.address})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="items" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>

              {role === "ADMIN" && (
                <>
                  <TabsTrigger value="stock">Log Stock</TabsTrigger>
                  <TabsTrigger value="borrow">Log Borrow</TabsTrigger>
                </>
              )}
            </TabsList>

            {role === "ADMIN" && (
              <AddItemDialog locationId={selectedLocation} />
            )}
          </div>

          <TabsContent value="items">
            <ItemsTable locationId={selectedLocation} />
          </TabsContent>

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
