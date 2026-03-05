import { useEffect } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  type HubConnection,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { getHubUrl } from "@/shared/config/api";

export const useInboundManagementRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;
    let isDisposed = false;
    const retryTimers = new Set<ReturnType<typeof setTimeout>>();

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("branch-notificationHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    const refreshInboundData = () => {
      void queryClient.invalidateQueries({
        queryKey: ["branch-manager-pending-supplier-shipments"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-receipts"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-incoming-shipments"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-activity-log"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["inbound-kpis"],
      });
    };

    connection.on("InboundShipmentSubmitted", refreshInboundData);
    connection.on("InboundShipmentApproved", refreshInboundData);
    connection.on("InboundQueueUpdated", refreshInboundData);
    connection.on("PutAwayTaskUpdated", refreshInboundData);
    connection.on("BinLocationUpdated", refreshInboundData);

    const startConnectionWithRetry = (hub: HubConnection, delayMs = 1000) => {
      if (isDisposed) return;
      void hub.start().catch(() => {
        if (isDisposed) return;
        const nextDelay = Math.min(delayMs * 2, 10000);
        const timer = setTimeout(() => {
          retryTimers.delete(timer);
          startConnectionWithRetry(hub, nextDelay);
        }, delayMs);
        retryTimers.add(timer);
      });
    };

    startConnectionWithRetry(connection);

    return () => {
      isDisposed = true;
      connection.off("InboundShipmentSubmitted", refreshInboundData);
      connection.off("InboundShipmentApproved", refreshInboundData);
      connection.off("InboundQueueUpdated", refreshInboundData);
      connection.off("PutAwayTaskUpdated", refreshInboundData);
      connection.off("BinLocationUpdated", refreshInboundData);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
      for (const timer of retryTimers) {
        clearTimeout(timer);
      }
      retryTimers.clear();
    };
  }, [queryClient]);
};
