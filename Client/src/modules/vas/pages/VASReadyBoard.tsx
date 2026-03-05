import { getPublicVASOutboundReadyItems } from "@/modules/vas/services/vasWorkflow";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

export default function VASReadyBoard() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vas-public-outbound-ready-items"],
    queryFn: getPublicVASOutboundReadyItems,
    retry: false,
    refetchInterval: 3000,
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 rounded-2xl bg-[#001F3F] text-white px-6 py-5 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-7 text-emerald-300" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-wide">
                Outbound Ready Board
              </h1>
              <p className="text-sm text-slate-300">
                Public display for picking area • Auto-refresh every 3 seconds
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs uppercase tracking-widest text-slate-300">Ready Items</p>
              <p className="text-3xl font-black text-[#FFD700]">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Order</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">SKU / Size</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Qty</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Courier</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                    Loading ready board...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                    No outbound-ready items.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.orderId} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{item.orderId}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.sku} / {item.size}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">{item.customerName}</td>
                    <td className="px-4 py-3 text-sm">{item.courierId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="size-3" />
                        Outbound Ready
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
