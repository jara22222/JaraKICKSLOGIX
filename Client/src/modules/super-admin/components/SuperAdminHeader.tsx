import { Bell, ChevronRight, ShieldCheck } from "lucide-react";
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
  const [notifications, setNotifications] = useState<
    { id: string; message: string; createdAt: string; read: boolean }[]
  >([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

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
      setNotifications((prev) => [
        {
          id: crypto.randomUUID(),
          message,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
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
    supplierConnection.on("ReceiveNewBranchManager", (payload: any) => {
      addNotification(
        `New manager added (${payload?.branch ?? "N/A"}): ${payload?.userName ?? "Unknown"}`,
      );
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
      supplierConnection.off("ReceiveNewBranchManager");
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
    if (!isOpen) {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
    }
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
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Notifications
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 20).map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-slate-50">
                      <p className="text-xs text-slate-700">{notification.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
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
