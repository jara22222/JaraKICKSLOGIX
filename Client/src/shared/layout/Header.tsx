import { Bell, CheckCheck, ChevronRight, Circle, LogOut, Settings, Trash2 } from "lucide-react";
import MobileSidebar from "@/shared/layout/MobileSidebar";
import { Link, useLocation } from "react-router-dom";
import { UseAuth } from "../security/UseAuth";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggleButton from "../theme/ThemeToggleButton";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { getHubUrl } from "@/shared/config/api";

const BREADCRUMB_LABELS: Record<string, string> = {
  accesscontroll: "Admin Panel",
  accessmanagement: "Admin & Access",
  archivedusers: "Archived Users",
  suppliermanagement: "Supply Management",
  binmanagement: "Bin Management",
  binsarchived: "Bins Archived",
  inboundmanagement: "Inbound",
  outboundmanagement: "Outbound",
  inventorymanagement: "Inventory",
  auditlogs: "Audit Logs",
  profilesettings: "Account Settings",
};

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationFilter = "all" | "unread" | "read";
const MAX_NOTIFICATIONS = 100;

export default function AcessControllHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const { user, logout } = UseAuth();
  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Branch Manager";
  const displayRole = user?.roles?.[0] ?? "BranchManager";
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
      return `kickslogix-branch-notifications:${String(userId)}`;
    } catch {
      return "kickslogix-branch-notifications:default";
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
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }
    if (filter === "read") {
      return notifications.filter((notification) => notification.read);
    }
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

    const createConnection = (hubPath: string) =>
      new HubConnectionBuilder()
        .withUrl(getHubUrl(hubPath), {
          accessTokenFactory: () => token,
          withCredentials: false,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

    const branchNotificationConnection = createConnection("branch-notificationHub");
    const branchAccountConnection = createConnection("branchAccount-managerHub");

    branchNotificationConnection.on("InboundShipmentSubmitted", (payload: any) => {
      addNotification(
        `Inbound submitted: ${payload?.sku ?? "Unknown SKU"} (${payload?.quantity ?? 0}) from ${
          payload?.supplierName ?? "Unknown supplier"
        }.`,
      );
    });
    branchNotificationConnection.on("InboundShipmentApproved", (payload: any) => {
      addNotification(
        `Shipment approved for receiver: ${payload?.productId ?? "Unknown product"}.`,
      );
    });
    branchNotificationConnection.on("LowStockAlert", (payload: any) => {
      addNotification(
        payload?.message ||
          `Low stock alert: ${payload?.sku ?? "Unknown SKU"} (${payload?.size ?? "-"}) is ${
            payload?.quantityOnHand ?? 0
          }.`,
      );
    });
    branchAccountConnection.on("ReceiveNewBranchUser", (payload: any) => {
      const userName =
        payload?.UserName ??
        payload?.userName ??
        payload?.username ??
        payload?.Email ??
        payload?.email ??
        "Unknown";
      const role =
        payload?.Role ??
        payload?.role ??
        payload?.RoleName ??
        payload?.roleName ??
        "Role";
      addNotification(
        `New branch user: ${userName} (${role}).`,
      );
    });
    branchAccountConnection.on("PasswordResetRequested", (payload: any) => {
      const currentBranch =
        user?.branch ||
        (() => {
          try {
            const localUser = JSON.parse(localStorage.getItem("user") ?? "{}");
            return localUser?.branch ?? "";
          } catch {
            return "";
          }
        })();
      if (
        currentBranch &&
        payload?.branch &&
        String(currentBranch).toLowerCase() !== String(payload.branch).toLowerCase()
      ) {
        return;
      }
      addNotification(
        `Password reset request: ${payload?.userEmail ?? "Unknown user"} (${payload?.branch ?? "Unknown branch"}).`,
      );
    });

    const startConnection = async (connection: any) => {
      if (isDisposed) {
        return;
      }
      try {
        await connection.start();
      } catch (error) {
        if (isDisposed) return;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("stopped during negotiation") || message.includes("aborted")) {
          return;
        }
      }
    };

    void startConnection(branchNotificationConnection);
    void startConnection(branchAccountConnection);

    return () => {
      isDisposed = true;
      branchNotificationConnection.off("InboundShipmentSubmitted");
      branchNotificationConnection.off("InboundShipmentApproved");
      branchNotificationConnection.off("LowStockAlert");
      branchAccountConnection.off("ReceiveNewBranchUser");
      branchAccountConnection.off("PasswordResetRequested");

      const stopConnection = (connection: any) => {
        if (
          connection.state === HubConnectionState.Connected ||
          connection.state === HubConnectionState.Reconnecting
        ) {
          void connection.stop().catch(() => undefined);
        }
      };
      stopConnection(branchNotificationConnection);
      stopConnection(branchAccountConnection);
    };
  }, [user?.branch]);

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
      <MobileSidebar />
      <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <Link
              to="/accesscontroll"
              className="text-slate-400 hover:text-[#001F3F] transition-colors font-medium"
            >
              Dashboard
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
          <span className="hidden lg:inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            Branch: {displayBranch}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative">
          <Link
            to="/accesscontroll/profilesettings"
            className="inline-flex lg:hidden items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-blue-50 hover:text-[#001F3F] transition-colors"
            aria-label="Open profile settings"
          >
            <Settings className="size-4" />
          </Link>
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c33] px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
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
              <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-1rem))] bg-white dark:bg-[#0f1c33] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    to="/accesscontroll/profilesettings"
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
              <div className="absolute right-0 top-10 w-[min(20rem,calc(100vw-1rem))] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
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
                              notification.read
                                ? "text-slate-300"
                                : "text-blue-500 fill-blue-500"
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
