import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useEffect, useMemo, useRef, useState } from "react";
import { getHubUrl } from "@/shared/config/api";
import { useQueryClient } from "@tanstack/react-query";

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationFilter = "all" | "unread" | "read";

const MAX_NOTIFICATIONS = 100;

export default function RoleNotificationBell({ storageKey }: { storageKey: string }) {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const displayBranch = useMemo(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem("user") ?? "{}");
      const branch = localUser?.branch ?? localUser?.Branch;
      if (branch && String(branch).trim()) {
        return String(branch).trim();
      }
    } catch {
      // ignore localStorage parse errors
    }
    return "Unassigned Branch";
  }, []);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.message === "string" &&
          typeof item.createdAt === "string" &&
          typeof item.read === "boolean",
      ) as NotificationItem[];
    } catch {
      return [];
    }
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }
    if (filter === "read") {
      return notifications.filter((notification) => notification.read);
    }
    return notifications;
  }, [notifications, filter]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [storageKey, notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) {
      return;
    }

    let isDisposed = false;

    const addNotification = (message: string) => {
      setNotifications((prev) => {
        const next = [
          {
            id: crypto.randomUUID(),
            message,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ];
        return next.slice(0, MAX_NOTIFICATIONS);
      });
    };
    const pickValue = (payload: any, keys: string[], fallback: string) => {
      for (const key of keys) {
        const value = payload?.[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value);
        }
      }
      return fallback;
    };
    const invalidateRoleRealtimeQueries = () => {
      void queryClient.invalidateQueries({ queryKey: ["dispatch-approved-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["dispatch-activity-log"] });
      void queryClient.invalidateQueries({ queryKey: ["vas-pending-items"] });
      void queryClient.invalidateQueries({ queryKey: ["vas-outbound-ready-items"] });
      void queryClient.invalidateQueries({ queryKey: ["vas-activity-log"] });
      void queryClient.invalidateQueries({ queryKey: ["vas-public-outbound-ready-items"] });
    };

    const branchNotificationConnection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();
    const branchAccountConnection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branchAccount-managerHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    branchNotificationConnection.on("InboundShipmentSubmitted", (payload: any) => {
      invalidateRoleRealtimeQueries();
      const sku = pickValue(payload, ["sku", "SKU"], "Unknown SKU");
      const quantity = pickValue(payload, ["quantity", "Quantity"], "0");
      const supplierName = pickValue(payload, ["supplierName", "SupplierName"], "Unknown supplier");
      addNotification(
        `Inbound submitted: ${sku} (${quantity}) from ${supplierName}.`,
      );
    });

    branchNotificationConnection.on("InboundShipmentApproved", (payload: any) => {
      invalidateRoleRealtimeQueries();
      const productId = pickValue(payload, ["productId", "ProductId", "sku", "SKU"], "Unknown product");
      addNotification(
        `Shipment approved for processing: ${productId}.`,
      );
    });

    branchNotificationConnection.on("LowStockAlert", (payload: any) => {
      invalidateRoleRealtimeQueries();
      addNotification(
        payload?.message ||
          `Low stock alert: ${payload?.sku ?? "Unknown SKU"} (${payload?.size ?? "-"}) is ${
            payload?.quantityOnHand ?? 0
          }.`,
      );
    });
    branchNotificationConnection.on("PutAwayTaskUpdated", (payload: any) => {
      invalidateRoleRealtimeQueries();
      const sku = pickValue(payload, ["sku", "SKU"], "Unknown SKU");
      const toStatus = pickValue(payload, ["toStatus", "ToStatus"], "updated");
      const performedBy = pickValue(payload, ["performedBy", "PerformedBy"], "PutAway");
      addNotification(
        `Put-away update: ${sku} moved to ${toStatus} by ${performedBy}.`,
      );
    });
    branchAccountConnection.on("PasswordResetRequested", (payload: any) => {
      const email = pickValue(payload, ["userEmail", "UserEmail"], "unknown@email");
      const branch = pickValue(payload, ["branch", "Branch"], "Unknown branch");
      addNotification(`Password reset requested by ${email} (${branch}).`);
    });
    branchAccountConnection.on("PasswordResetRequestUpdated", (payload: any) => {
      const status = pickValue(payload, ["status", "Status"], "Updated");
      const requestId = pickValue(payload, ["requestId", "RequestId"], "N/A");
      addNotification(`Password reset ${status.toLowerCase()}: ${requestId}.`);
    });

    const startConnection = async () => {
      if (isDisposed) {
        return;
      }
      try {
        await branchNotificationConnection.start();
      } catch (error) {
        if (isDisposed) return;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("stopped during negotiation") || message.includes("aborted")) {
          return;
        }
      }
    };
    void startConnection();
    const startBranchAccountConnection = async () => {
      if (isDisposed) {
        return;
      }
      try {
        await branchAccountConnection.start();
      } catch (error) {
        if (isDisposed) return;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("stopped during negotiation") || message.includes("aborted")) {
          return;
        }
      }
    };
    void startBranchAccountConnection();

    return () => {
      isDisposed = true;
      branchNotificationConnection.off("InboundShipmentSubmitted");
      branchNotificationConnection.off("InboundShipmentApproved");
      branchNotificationConnection.off("LowStockAlert");
      branchNotificationConnection.off("PutAwayTaskUpdated");
      branchAccountConnection.off("PasswordResetRequested");
      branchAccountConnection.off("PasswordResetRequestUpdated");
      if (
        branchNotificationConnection.state === HubConnectionState.Connected ||
        branchNotificationConnection.state === HubConnectionState.Reconnecting
      ) {
        void branchNotificationConnection.stop().catch(() => undefined);
      }
      if (
        branchAccountConnection.state === HubConnectionState.Connected ||
        branchAccountConnection.state === HubConnectionState.Reconnecting
      ) {
        void branchAccountConnection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);

  const formatNotificationTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification,
      ),
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-[70] flex flex-col items-end gap-2">
      <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-blue-700 shadow-sm">
        Branch: {displayBranch}
      </span>
      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Notifications
              </p>
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] font-bold text-[#001F3F] hover:underline disabled:text-slate-300 disabled:no-underline"
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  filter === "all"
                    ? "bg-slate-100 text-[#001F3F]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  filter === "unread"
                    ? "bg-blue-100 text-[#001F3F]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setFilter("read")}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  filter === "read"
                    ? "bg-emerald-100 text-[#001F3F]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Read
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-xs text-slate-400">
                No {filter === "all" ? "" : filter} notifications.
              </div>
            ) : (
              filteredNotifications.slice(0, 20).map((notification) => (
                <div key={notification.id} className="p-3 hover:bg-slate-50">
                  <div className="flex items-start gap-2">
                    <Circle
                      className={`size-2 mt-1.5 ${
                        notification.read ? "text-slate-300" : "text-blue-500 fill-blue-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-700">{notification.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatNotificationTime(notification.createdAt)} •{" "}
                        {notification.read ? "Read" : "Unread"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => toggleNotificationRead(notification.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-[#001F3F] hover:bg-slate-100"
                    >
                      <CheckCheck className="size-3" />
                      {notification.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNotification(notification.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-[#001F3F] transition-colors relative shadow-sm"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
