import {
  Bell,
  CheckCheck,
  ChevronRight,
  Circle,
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import SuperAdminMobileSidebar from "@/shared/layout/SuperAdminMobileSidebar";
import { Link, useLocation } from "react-router-dom";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useEffect, useMemo, useRef, useState } from "react";
import { getHubUrl } from "@/shared/config/api";
import { UseAuth } from "@/shared/security/UseAuth";
import ThemeToggleButton from "@/shared/theme/ThemeToggleButton";

const BREADCRUMB_LABELS: Record<string, string> = {
  superadmin: "Overview",
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
  const { user, logout } = UseAuth();
  const segments = location.pathname.split("/").filter(Boolean);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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

    const createConnection = (hubPath: string) =>
      new HubConnectionBuilder()
        .withUrl(getHubUrl(hubPath), {
          accessTokenFactory: () => token,
          withCredentials: false,
        })
        .withAutomaticReconnect()
        // Keep SignalR internal negotiation noise out of console.
        .configureLogging(LogLevel.None)
        .build();

    const supplierConnection = createConnection("supplierHub");
    const managerConnection = createConnection("managerHub");
    const updateManagerConnection = createConnection("update-managerHub");
    const archiveManagerConnection = createConnection("archive-managerHub");
    const branchAccountConnection = createConnection("branchAccount-managerHub");

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
      const branch = pickValue(payload, ["branch", "Branch"], "N/A");
      const userName = pickValue(payload, ["userName", "UserName", "username", "email", "Email"], "Unknown");
      addNotification(
        `Manager created (${branch}): ${userName}`,
      );
    });
    updateManagerConnection.on("ManagerUpdated", (payload: any) => {
      const branch = pickValue(payload, ["branch", "Branch"], "N/A");
      const userName = pickValue(payload, ["userName", "UserName", "username", "email", "Email"], "Unknown");
      addNotification(
        `Manager updated (${branch}): ${userName}`,
      );
    });
    archiveManagerConnection.on("ManagerArchived", (payload: any) => {
      const branch = pickValue(payload, ["branch", "Branch"], "N/A");
      const userName = pickValue(payload, ["userName", "UserName", "username", "email", "Email"], "Unknown");
      addNotification(
        `Manager archived (${branch}): ${userName}`,
      );
    });
    archiveManagerConnection.on("ManagerRestored", (payload: any) => {
      const branch = pickValue(payload, ["branch", "Branch"], "N/A");
      const userName = pickValue(payload, ["userName", "UserName", "username", "email", "Email"], "Unknown");
      addNotification(
        `Manager restored (${branch}): ${userName}`,
      );
    });
    branchAccountConnection.on("PasswordResetRequested", (payload: any) => {
      const branch = pickValue(payload, ["branch", "Branch"], "N/A");
      const userEmail = pickValue(payload, ["userEmail", "UserEmail", "email", "Email"], "Unknown user");
      addNotification(
        `Password reset request (${branch}): ${userEmail}`,
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
        const message = error instanceof Error ? error.message : "";
        if (
          message.toLowerCase().includes("stopped during negotiation") ||
          message.toLowerCase().includes("aborted")
        ) {
          return;
        }
      }
    };

    void startConnection(supplierConnection);
    void startConnection(managerConnection);
    void startConnection(updateManagerConnection);
    void startConnection(archiveManagerConnection);
    void startConnection(branchAccountConnection);

    return () => {
      isDisposed = true;

      supplierConnection.off("SupplierCreated");
      supplierConnection.off("SupplierUpdated");
      supplierConnection.off("SupplierArchived");
      managerConnection.off("ManagerCreated");
      updateManagerConnection.off("ManagerUpdated");
      archiveManagerConnection.off("ManagerArchived");
      archiveManagerConnection.off("ManagerRestored");
      branchAccountConnection.off("PasswordResetRequested");

      const stopConnection = (connection: any) => {
        if (
          connection.state === HubConnectionState.Connected ||
          connection.state === HubConnectionState.Reconnecting
        ) {
          void connection.stop().catch(() => undefined);
        }
      };

      stopConnection(supplierConnection);
      stopConnection(managerConnection);
      stopConnection(updateManagerConnection);
      stopConnection(archiveManagerConnection);
      stopConnection(branchAccountConnection);
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

  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Super Admin";
  const displayRole = user?.roles?.[0] ?? "SuperAdmin";
  const displayBranch = useMemo(() => {
    const branchFromUser = (user as any)?.branch ?? (user as any)?.Branch;
    if (branchFromUser && String(branchFromUser).trim()) {
      return String(branchFromUser).trim();
    }
    return "All Branches";
  }, [user]);

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
          <span className="hidden lg:inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Branch: {displayBranch}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 relative">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1c33] px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-[#001F3F] text-xs font-bold text-[#FFD700]">
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
                    to="/settings/profile"
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
          <div ref={menuRef}>
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
        </div>
      </header>
    </>
  );
}
