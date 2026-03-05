import { useEffect } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { getHubUrl } from "@/shared/config/api";

export const useInboundManagementRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    let isDisposed = false;

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
    };

    connection.on("InboundShipmentSubmitted", refreshInboundData);
    connection.on("InboundShipmentApproved", refreshInboundData);

    const startConnection = async () => {
      if (isDisposed) return;
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

    void startConnection();

    return () => {
      isDisposed = true;
      connection.off("InboundShipmentSubmitted", refreshInboundData);
      connection.off("InboundShipmentApproved", refreshInboundData);
      if (
        connection.state === HubConnectionState.Connected ||
        connection.state === HubConnectionState.Reconnecting
      ) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);
};
