import { getHubUrl } from "@/shared/config/api";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useEffect, useMemo, useState } from "react";

type RealtimeState = "connecting" | "connected" | "reconnecting" | "offline";

export default function RealtimeStatusBadge({
  rightOffsetClass = "right-4",
}: {
  rightOffsetClass?: string;
}) {
  const [state, setState] = useState<RealtimeState>("connecting");

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) {
      setState("offline");
      return;
    }

    let isDisposed = false;
    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.onreconnecting(() => {
      if (!isDisposed) setState("reconnecting");
    });

    connection.onreconnected(() => {
      if (!isDisposed) setState("connected");
    });

    connection.onclose(() => {
      if (!isDisposed) setState("offline");
    });

    const start = async () => {
      setState("connecting");
      try {
        await connection.start();
        if (!isDisposed) setState("connected");
      } catch {
        if (!isDisposed) setState("offline");
      }
    };

    void start();

    return () => {
      isDisposed = true;
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, []);

  const { dotClass, label } = useMemo(() => {
    switch (state) {
      case "connected":
        return { dotClass: "bg-emerald-500", label: "Realtime Connected" };
      case "reconnecting":
        return { dotClass: "bg-amber-500", label: "Realtime Reconnecting" };
      case "connecting":
        return { dotClass: "bg-blue-500", label: "Realtime Connecting" };
      default:
        return { dotClass: "bg-rose-500", label: "Realtime Offline" };
    }
  }, [state]);

  return (
    <div
      className={`fixed top-4 ${rightOffsetClass} z-[69] inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1 shadow-sm`}
      title={label}
    >
      <span className={`size-2 rounded-full ${dotClass}`} />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </span>
    </div>
  );
}
