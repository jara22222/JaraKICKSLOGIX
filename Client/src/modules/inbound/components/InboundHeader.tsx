import {
  Bell,
  CheckCheck,
  ChevronRight,
  Circle,
  LogOut,
  PackageCheck,
  Settings,
  Trash2,
} from "lucide-react";
import InboundMobileSidebar from "@/shared/layout/InboundMobileSidebar";
import { Link, useLocation } from "react-router-dom";
import { UseAuth } from "@/shared/security/UseAuth";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggleButton from "@/shared/theme/ThemeToggleButton";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { getHubUrl } from "@/shared/config/api";
import { useQueryClient } from "@tanstack/react-query";

const BREADCRUMB_LABELS: Record<string, string> = {
  inbound: "Inbound",
  incoming: "Incoming Shipments",
  putaway: "Assigning & Labeling",
  labeling: "Assigning & Labeling",
  assigned: "Assigned",
  activity: "Activity Log",
  accountsettings: "Account Settings",
};

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationFilter = "all" | "unread" | "read";
const MAX_NOTIFICATIONS = 100;

export default function InboundHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const { user, logout } = UseAuth();
  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Inbound User";
  const displayRole = user?.roles?.[0] ?? "Receiver";
  const displayBranch = useMemo(() => {
    const branchFromUser = (user as any)?.branch ?? (user as any)?.Branch;
    if (branchFromUser && String(branchFromUser).trim()) {
      return String(branchFromUser).trim();
    }
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
  }, [user]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationStorageKey = useMemo(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem("user") ?? "{}");
      const userId =
        user?.id ||
        localUser?.id ||
        localUser?.userId ||
        localUser?.userName ||
        "default";
      return `kickslogix-receiver-notifications:${String(userId)}`;
    } catch {
      return "kickslogix-receiver-notifications:default";
    }
  }, [user?.id]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(notificationStorageKey);
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
    if (filter === "unread") return notifications.filter((notification) => !notification.read);
    if (filter === "read") return notifications.filter((notification) => notification.read);
    return notifications;
  }, [notifications, filter]);

  useEffect(() => {
    localStorage.setItem(notificationStorageKey, JSON.stringify(notifications));
  }, [notificationStorageKey, notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
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
    const invalidateInboundRealtimeQueries = () => {
      void queryClient.invalidateQueries({ queryKey: ["inbound-kpis"] });
      void queryClient.invalidateQueries({ queryKey: ["inbound-incoming-shipments"] });
      void queryClient.invalidateQueries({ queryKey: ["inbound-activity-log"] });
      void queryClient.invalidateQueries({ queryKey: ["inbound-receipts"] });
      void queryClient.invalidateQueries({ queryKey: ["receiver-assigned-items"] });
      void queryClient.invalidateQueries({ queryKey: ["putaway-pending-products"] });
    };

    const branchNotificationConnection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    // Receiver-focused events only.
    branchNotificationConnection.on("InboundShipmentApproved", (payload: any) => {
      invalidateInboundRealtimeQueries();
      const productId = pickValue(payload, ["productId", "ProductId", "sku", "SKU"], "Unknown product");
      addNotification(
        `Shipment approved for receiving: ${productId}.`,
      );
    });
    branchNotificationConnection.on("InboundShipmentSubmitted", (payload: any) => {
      invalidateInboundRealtimeQueries();
      const sku = pickValue(payload, ["sku", "SKU"], "Unknown SKU");
      const supplierName = pickValue(payload, ["supplierName", "SupplierName"], "Unknown supplier");
      const quantity = pickValue(payload, ["quantity", "Quantity"], "0");
      addNotification(
        `Incoming shipment: ${sku} (${quantity}) from ${supplierName}.`,
      );
    });
    branchNotificationConnection.on("PutAwayTaskUpdated", (payload: any) => {
      invalidateInboundRealtimeQueries();
      const sku = pickValue(payload, ["sku", "SKU"], "Unknown SKU");
      const toStatus = pickValue(payload, ["toStatus", "ToStatus"], "updated");
      const performedBy = pickValue(payload, ["performedBy", "PerformedBy"], "PutAway");
      addNotification(
        `Put-away update: ${sku} moved to ${toStatus} by ${performedBy}.`,
      );
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

    return () => {
      isDisposed = true;
      branchNotificationConnection.off("InboundShipmentApproved");
      branchNotificationConnection.off("InboundShipmentSubmitted");
      branchNotificationConnection.off("PutAwayTaskUpdated");
      if (
        branchNotificationConnection.state === HubConnectionState.Connected ||
        branchNotificationConnection.state === HubConnectionState.Reconnecting
      ) {
        void branchNotificationConnection.stop().catch(() => undefined);
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
    <>
      <InboundMobileSidebar />
      <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <PackageCheck className="size-4 text-emerald-500 hidden lg:block" />
          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <Link
              to="/inbound"
              className="text-slate-400 hover:text-[#001F3F] transition-colors font-medium"
            >
              Inbound Portal
            </Link>
            {segments.slice(1).map((seg, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <ChevronRight className="size-3 text-slate-300" />
                <span className="text-[#001F3F] font-bold">
                  {BREADCRUMB_LABELS[seg] || seg}
                </span>
              </span>
            ))}
            {segments.length <= 1 && (
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-slate-300" />
                <span className="text-[#001F3F] font-bold">{title}</span>
              </span>
            )}
          </nav>
          <span className="text-[10px] text-slate-400 hidden lg:block ml-2 font-medium">
            — {label}
          </span>
          <span className="hidden lg:inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Branch: {displayBranch}
          </span>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c33] px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight text-left">
                <p className="text-xs font-semibold text-[#001F3F] dark:text-slate-100">{displayName}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-300">{displayRole}</p>
              </div>
              <ChevronRight
                className={`size-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? "-rotate-90" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1c33] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">
                    Account
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user?.email || "user@kickslogix.com"}
                  </p>
                </div>
                <div className="p-2">
                  <Link
                    to="/inbound/accountsettings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-lg transition-colors"
                  >
                    <Settings className="size-4" />
                    Account Settings
                  </Link>
                  <ThemeToggleButton className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-lg transition-colors" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={notificationRef}>
            {isNotificationOpen && (
              <div className="absolute right-0 top-10 w-[90vw] max-w-80 bg-white dark:bg-[#0f1c33] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Notifications
                    </p>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#001F3F] dark:text-slate-100 hover:underline disabled:text-slate-300 disabled:no-underline"
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
                          ? "bg-slate-100 dark:bg-slate-700 text-[#001F3F] dark:text-slate-100"
                          : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("unread")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        filter === "unread"
                          ? "bg-blue-100 dark:bg-blue-500/20 text-[#001F3F] dark:text-blue-100"
                          : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70"
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("read")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        filter === "read"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-[#001F3F] dark:text-emerald-100"
                          : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70"
                      }`}
                    >
                      Read
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 dark:text-slate-300">
                      No {filter === "all" ? "" : filter} notifications.
                    </div>
                  ) : (
                    filteredNotifications.slice(0, 20).map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div className="flex items-start gap-2">
                          <Circle
                            className={`size-2 mt-1.5 ${
                              notification.read ? "text-slate-300" : "text-blue-500 fill-blue-500"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-700 dark:text-slate-100">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-300 mt-1">
                              {formatNotificationTime(notification.createdAt)} •{" "}
                              {notification.read ? "Read" : "Unread"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => toggleNotificationRead(notification.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-[#001F3F] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                          >
                            <CheckCheck className="size-3" />
                            {notification.read ? "Mark unread" : "Mark read"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNotification(notification.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20"
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
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-[#001F3F] transition-colors relative"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
