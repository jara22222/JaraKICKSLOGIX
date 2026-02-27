import { useEffect } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { getHubUrl } from "@/shared/config/api";
import { showErrorToast } from "@/shared/lib/toast";

export const useManagerRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    let isDisposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl("supplierHub"), {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ReceiveNewBranchManager", () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-managers"] });
    });

    const startConnection = async () => {
      try {
        await connection.start();
      } catch (error) {
        if (isDisposed) return;

        const message =
          error instanceof Error ? error.message : "Unknown connection error";

        // React StrictMode may stop a dev connection during setup.
        if (message.includes("stopped during negotiation")) return;

        showErrorToast("Realtime connection failed for managers.");
      }
    };

    void startConnection();

    return () => {
      isDisposed = true;
      connection.off("ReceiveNewBranchManager");
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop().catch(() => undefined);
      }
    };
  }, [queryClient]);
};
