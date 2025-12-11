"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import ItemsTable from "./itemsTable";
import StockLogTable from "./stockLogTable";
import BorrowLogTable from "./borrowLogTable";
import AddItemDialog from "./AddItemDialog";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Represent Pondok Cabe</h1>

      {/* Hanya header: TabsList + tombol */}
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="items" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="stock">Log Stock</TabsTrigger>
              <TabsTrigger value="borrow">Log Borrow</TabsTrigger>
            </TabsList>

            <AddItemDialog />
          </div>

          {/* CONTENT ADA DI DALAM TABS YANG SAMA */}
          <TabsContent value="items">
            <ItemsTable />
          </TabsContent>

          <TabsContent value="stock">
            <StockLogTable />
          </TabsContent>

          <TabsContent value="borrow">
            <BorrowLogTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
