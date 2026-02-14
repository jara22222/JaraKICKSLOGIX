import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { UsePartnerState } from "@/zustand/UseGetPartner";
import HeaderCell from "../suppliermanagementcomponents/suppliertableComponents/HeaderCell";
import StatusBadge from "../suppliermanagementcomponents/suppliertableComponents/StatusBadge";
export default function InvetorTable() {
  // --- MOCK DATA ---
  const INVENTORY_DATA = [
    {
      id: "BIN-A01-01",
      status: "Occupied",
      brand: "Nike",
      product: "Air Jordan 1 High",
      sku: "NK-AJ1-CHI",
      size: "US 10",
      category: "High-Top",
      qty: 50,
      capacity: 50,
    },
    {
      id: "BIN-A01-02",
      status: "Occupied",
      brand: "Nike",
      product: "Dunk Low Panda",
      sku: "NK-DNK-PND",
      size: "US 9",
      category: "Lifestyle",
      qty: 45,
      capacity: 50,
    },
    {
      id: "BIN-A01-03",
      status: "Available",
      brand: "-",
      product: "-",
      sku: "-",
      size: "-",
      category: "-",
      qty: 0,
      capacity: 50,
    },
    {
      id: "BIN-B02-01",
      status: "Occupied",
      brand: "Adidas",
      product: "Yeezy Boost 350",
      sku: "AD-YZY-BLK",
      size: "US 11",
      category: "Lifestyle",
      qty: 30,
      capacity: 40,
    },
    {
      id: "BIN-B02-02",
      status: "Available",
      brand: "-",
      product: "-",
      sku: "-",
      size: "-",
      category: "-",
      qty: 0,
      capacity: 40,
    },
    {
      id: "BIN-C05-01",
      status: "Occupied",
      brand: "Puma",
      product: "RS-X Reinvention",
      sku: "PM-RSX-009",
      size: "US 8",
      category: "Running",
      qty: 25,
      capacity: 30,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <HeaderCell label="Bin Location" />
                <HeaderCell label="Status" />
                <HeaderCell label="Brand" />
                <HeaderCell label="Product / SKU" />
                <HeaderCell label="Category" />
                <HeaderCell label="Size" />
                <HeaderCell label="Quantity / Cap" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INVENTORY_DATA.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Bin ID */}
                  <td className="p-4">
                    <span className="text-sm font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {item.id}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Brand */}
                  <td className="p-4">
                    <span
                      className={`text-sm font-bold ${item.brand === "-" ? "text-slate-300" : "text-slate-700"}`}
                    >
                      {item.brand}
                    </span>
                  </td>

                  {/* Product / SKU */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${item.product === "-" ? "text-slate-300" : "text-[#001F3F]"}`}
                      >
                        {item.product}
                      </span>
                      {item.sku !== "-" && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.sku}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span
                      className={`text-xs ${item.category === "-" ? "text-slate-300" : "text-slate-600 font-medium"}`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="p-4">
                    <span
                      className={`text-xs ${item.size === "-" ? "text-slate-300" : "font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100"}`}
                    >
                      {item.size}
                    </span>
                  </td>

                  {/* Quantity Bar */}
                  <td className="p-4 w-32">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{item.qty}</span>
                      <span>{item.capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.status === "Available" ? "bg-slate-200" : "bg-[#001F3F]"}`}
                        style={{
                          width: `${(item.qty / item.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {INVENTORY_DATA.length} of 42 staff members
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-left">
                <ChevronLeft className="size-4" />
              </i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#001F3F] text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-right">
                <ChevronRight className="size-4" />
              </i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
