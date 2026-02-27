import { Bell, CheckCheck, ChevronRight, Circle, ShieldCheck, Trash2 } from "lucide-react";
import SuperAdminMobileSidebar from "@/shared/layout/SuperAdminMobileSidebar";
import { Link, useLocation } from "react-router-dom";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useEffect, useMemo, useRef, useState } from "react";
import { getHubUrl } from "@/shared/config/api";

const BREADCRUMB_LABELS: Record<string, string> = {
  superadmin: "God View",
  settings: "Settings",
  profile: "Account Settings",
  managers: "Branch Managers",
  archived: "Archived Users",
  suppliers: "Supplier Registry",
  auditlogs: "Audit Logs",
};

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationFilter = "all" | "unread" | "read";

const MAX_NOTIFICATIONS = 100;

export default function SuperAdminHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const notificationStorageKey = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      const userId = user?.id || user?.userId || user?.userName || "default";
      return `kickslogix-notifications:${String(userId)}`;
    } catch {
      return "kickslogix-notifications:default";
    }
  }, []);
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
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
        .configureLogging(LogLevel.Warning)
        .build();

    const supplierConnection = createConnection("supplierHub");
    const managerConnection = createConnection("managerHub");
    const updateManagerConnection = createConnection("update-managerHub");
    const archiveManagerConnection = createConnection("archive-managerHub");

    supplierConnection.on("SupplierCreated", (payload: any) => {
      addNotification(`New supplier added: ${payload?.companyName ?? "Unknown"}`);
    });
    supplierConnection.on("SupplierUpdated", (payload: any) => {
      addNotification(`Supplier updated: ${payload?.companyName ?? "Unknown"}`);
    });
    supplierConnection.on("SupplierArchived", (payload: any) => {
      addNotification(`Supplier archived: ${payload?.companyName ?? "Unknown"}`);
    });
    managerConnection.on("ManagerCreated", (payload: any) => {
      addNotification(
        `Manager created (${payload?.branch ?? "N/A"}): ${payload?.userName ?? "Unknown"}`,
      );
    });
    updateManagerConnection.on("ManagerUpdated", (payload: any) => {
      addNotification(
        `Manager updated (${payload?.branch ?? "N/A"}): ${payload?.userName ?? "Unknown"}`,
      );
    });
    archiveManagerConnection.on("ManagerArchived", (payload: any) => {
      addNotification(
        `Manager archived (${payload?.branch ?? "N/A"}): ${payload?.userName ?? "Unknown"}`,
      );
    });
    archiveManagerConnection.on("ManagerRestored", (payload: any) => {
      addNotification(
        `Manager restored (${payload?.branch ?? "N/A"}): ${payload?.userName ?? "Unknown"}`,
      );
    });

    const startConnection = async (connection: any) => {
      try {
        await connection.start();
      } catch (error) {
        if (isDisposed) return;
        const message = error instanceof Error ? error.message : "";
        if (message.includes("stopped during negotiation")) return;
      }
    };

    void startConnection(supplierConnection);
    void startConnection(managerConnection);
    void startConnection(updateManagerConnection);
    void startConnection(archiveManagerConnection);

    return () => {
      isDisposed = true;

      supplierConnection.off("SupplierCreated");
      supplierConnection.off("SupplierUpdated");
      supplierConnection.off("SupplierArchived");
      managerConnection.off("ManagerCreated");
      updateManagerConnection.off("ManagerUpdated");
      archiveManagerConnection.off("ManagerArchived");
      archiveManagerConnection.off("ManagerRestored");

      const stopConnection = (connection: any) => {
        if (connection.state !== HubConnectionState.Disconnected) {
          void connection.stop().catch(() => undefined);
        }
      };

      stopConnection(supplierConnection);
      stopConnection(managerConnection);
      stopConnection(updateManagerConnection);
      stopConnection(archiveManagerConnection);
    };
  }, []);

  const formatNotificationTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleToggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

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
      <SuperAdminMobileSidebar />
      <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-[#FFD700] hidden lg:block" />
          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <Link
              to="/superadmin"
              className="text-slate-400 hover:text-[#001F3F] transition-colors font-medium"
            >
              Super Admin
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
        </div>

        <div className="hidden sm:flex items-center gap-3 relative" ref={menuRef}>
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
            onClick={handleToggleNotifications}
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
      </header>
    </>
  );
}
