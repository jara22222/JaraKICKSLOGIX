import { getPublicVASOutboundReadyItems } from "@/modules/vas/services/vasWorkflow";
import { getHubUrl } from "@/shared/config/api";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function VASReadyBoard() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vas-public-outbound-ready-items"],
    queryFn: getPublicVASOutboundReadyItems,
    retry: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;

    let isDisposed = false;
    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    const refreshReadyBoard = () =>
      void queryClient.invalidateQueries({
        queryKey: ["vas-public-outbound-ready-items"],
      });

    connection.on("VASQueueUpdated", refreshReadyBoard);
    connection.on("OutboundQueueUpdated", refreshReadyBoard);

    const startConnection = async () => {
      if (isDisposed) return;
      try {
        await connection.start();
      } catch {
        // silent retry is handled by automatic reconnect
      }
    };

    void startConnection();

    return () => {
      isDisposed = true;
      connection.off("VASQueueUpdated", refreshReadyBoard);
      connection.off("OutboundQueueUpdated", refreshReadyBoard);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 rounded-2xl bg-[#001F3F] text-white px-4 sm:px-6 py-5 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CheckCircle2 className="size-7 text-emerald-300" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-wide">
                Outbound Ready Board
              </h1>
              <p className="text-sm text-slate-300">
                Ready-board display for picking area with realtime updates
              </p>
            </div>
            <div className="sm:ml-auto text-left sm:text-right">
              <p className="text-xs uppercase tracking-widest text-slate-300">Ready Items</p>
              <p className="text-3xl font-black text-[#FFD700]">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 space-y-3 md:hidden">
            {isLoading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading ready board...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No outbound-ready items.
              </div>
            ) : (
              items.map((item) => (
                <article
                  key={`${item.orderId}-mobile`}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-[#001F3F]">{item.orderId}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="size-3" />
                      Ready
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.sku} / {item.size}
                  </p>
                  <p className="text-sm font-bold text-[#001F3F]">Qty: {item.quantity}</p>
                  <p className="mt-1 text-xs text-slate-500 break-words">
                    Customer: {item.customerName}
                  </p>
                  <p className="text-xs text-slate-500 break-words">Courier: {item.courierId}</p>
                </article>
              ))
            )}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
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
    </div>
  );
}
