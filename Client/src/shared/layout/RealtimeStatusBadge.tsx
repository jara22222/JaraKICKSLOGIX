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

  const { label } = useMemo(() => {
    switch (state) {
      case "connected":
        return { label: "Realtime Connected" };
      case "reconnecting":
        return { label: "Realtime Reconnecting" };
      case "connecting":
        return { label: "Realtime Connecting" };
      default:
        return { label: "Realtime Offline" };
    }
  }, [state]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Console-only status for realtime diagnostics.
      console.info(`[SignalR] ${label} (${getHubUrl("branch-notificationHub")})`);
    }
  }, [label]);

  void rightOffsetClass;
  return null;
}
