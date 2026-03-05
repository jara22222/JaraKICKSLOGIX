import { useEffect } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { getHubUrl } from "@/shared/config/api";

type RealtimeScope = "superadmin" | "branch" | "inbound" | "outbound" | "vas";

const createHubConnection = (hubPath: string, token: string) =>
  new HubConnectionBuilder()
    .withUrl(getHubUrl(hubPath), {
      accessTokenFactory: () => token,
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();

export const useRoleRealtimeSync = (scope: RealtimeScope) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;

    let isDisposed = false;
    const invalidate = (queryKeys: string[][]) => {
      for (const queryKey of queryKeys) {
        void queryClient.invalidateQueries({ queryKey });
      }
    };

    const branchWorkflowKeys: string[][] = [
      ["branch-manager-pending-supplier-shipments"],
      ["branch-manager-pending-orders"],
      ["branch-manager-approved-orders"],
      ["branch-manager-outbound-logs"],
      ["branch-manager-inventory-items"],
      ["branch-employees"],
      ["branch-archived-employees"],
      ["branchmanager-bins"],
      ["branchmanager-archived-bins"],
      ["receiver-bin-locations"],
      ["branch-manager-audit-logs"],
      ["branch-password-reset-requests"],
      ["supplier-partners"],
      ["supplier-replenishment-orders"],
      ["inbound-incoming-shipments"],
      ["inbound-activity-log"],
      ["inbound-kpis"],
      ["inbound-receipts"],
      ["putaway-pending-products"],
      ["receiver-assigned-items"],
      ["dispatch-approved-orders"],
      ["dispatch-activity-log"],
      ["vas-pending-items"],
      ["vas-outbound-ready-items"],
      ["vas-activity-log"],
    ];

    const superAdminKeys: string[][] = [
      ["superadmin-managers"],
      ["superadmin-archived-managers"],
      ["superadmin-suppliers"],
      ["superadmin-audit-logs"],
      ["super-admin-password-reset-requests"],
    ];

    const targetKeysByScope: Record<RealtimeScope, string[][]> = {
      superadmin: superAdminKeys,
      branch: branchWorkflowKeys,
      inbound: [
        ["inbound-incoming-shipments"],
        ["inbound-activity-log"],
        ["inbound-kpis"],
        ["inbound-receipts"],
        ["putaway-pending-products"],
        ["receiver-assigned-items"],
      ],
      outbound: [
        ["dispatch-approved-orders"],
        ["dispatch-activity-log"],
      ],
      vas: [
        ["vas-pending-items"],
        ["vas-outbound-ready-items"],
        ["vas-public-outbound-ready-items"],
        ["vas-activity-log"],
      ],
    };

    const refreshScope = () => invalidate(targetKeysByScope[scope]);
    const retryTimers = new Set<ReturnType<typeof setTimeout>>();

    const branchNotificationConnection = createHubConnection("branch-notificationHub", token);
    branchNotificationConnection.on("InboundShipmentSubmitted", refreshScope);
    branchNotificationConnection.on("InboundShipmentApproved", refreshScope);
    branchNotificationConnection.on("InboundQueueUpdated", refreshScope);
    branchNotificationConnection.on("PutAwayTaskUpdated", refreshScope);
    branchNotificationConnection.on("OutboundOrderApproved", refreshScope);
    branchNotificationConnection.on("OutboundQueueUpdated", refreshScope);
    branchNotificationConnection.on("VASQueueUpdated", refreshScope);
    branchNotificationConnection.on("LowStockAlert", refreshScope);
    branchNotificationConnection.on("BinLocationUpdated", refreshScope);
    branchNotificationConnection.on("BranchNotificationUpdated", refreshScope);

    const branchAccountConnection = createHubConnection("branchAccount-managerHub", token);
    branchAccountConnection.on("PasswordResetRequested", refreshScope);
    branchAccountConnection.on("PasswordResetRequestUpdated", refreshScope);
    branchAccountConnection.on("ReceiveNewBranchUser", refreshScope);
    branchAccountConnection.on("BranchUserStatusChanged", refreshScope);

    const connections: HubConnection[] = [branchNotificationConnection, branchAccountConnection];

    if (scope === "superadmin") {
      const managerConnection = createHubConnection("managerHub", token);
      const updateManagerConnection = createHubConnection("update-managerHub", token);
      const archiveManagerConnection = createHubConnection("archive-managerHub", token);
      const supplierConnection = createHubConnection("supplierHub", token);

      managerConnection.on("ManagerCreated", refreshScope);
      updateManagerConnection.on("ManagerUpdated", refreshScope);
      archiveManagerConnection.on("ManagerArchived", refreshScope);
      archiveManagerConnection.on("ManagerRestored", refreshScope);
      supplierConnection.on("SupplierCreated", refreshScope);
      supplierConnection.on("SupplierUpdated", refreshScope);
      supplierConnection.on("SupplierArchived", refreshScope);

      connections.push(
        managerConnection,
        updateManagerConnection,
        archiveManagerConnection,
        supplierConnection,
      );
    }

    const startConnectionWithRetry = (connection: HubConnection, delayMs = 1000) => {
      if (isDisposed) return;
      void connection.start().catch(() => {
        if (isDisposed) return;
        const nextDelay = Math.min(delayMs * 2, 10000);
        const timer = setTimeout(() => {
          retryTimers.delete(timer);
          startConnectionWithRetry(connection, nextDelay);
        }, delayMs);
        retryTimers.add(timer);
      });
    };

    for (const connection of connections) {
      startConnectionWithRetry(connection);
    }

    return () => {
      isDisposed = true;
      branchNotificationConnection.off("InboundShipmentSubmitted", refreshScope);
      branchNotificationConnection.off("InboundShipmentApproved", refreshScope);
      branchNotificationConnection.off("InboundQueueUpdated", refreshScope);
      branchNotificationConnection.off("PutAwayTaskUpdated", refreshScope);
      branchNotificationConnection.off("OutboundOrderApproved", refreshScope);
      branchNotificationConnection.off("OutboundQueueUpdated", refreshScope);
      branchNotificationConnection.off("VASQueueUpdated", refreshScope);
      branchNotificationConnection.off("LowStockAlert", refreshScope);
      branchNotificationConnection.off("BinLocationUpdated", refreshScope);
      branchNotificationConnection.off("BranchNotificationUpdated", refreshScope);
      branchAccountConnection.off("PasswordResetRequested", refreshScope);
      branchAccountConnection.off("PasswordResetRequestUpdated", refreshScope);
      branchAccountConnection.off("ReceiveNewBranchUser", refreshScope);
      branchAccountConnection.off("BranchUserStatusChanged", refreshScope);

      for (const connection of connections) {
        if (
          connection.state === HubConnectionState.Connected ||
          connection.state === HubConnectionState.Reconnecting
        ) {
          void connection.stop().catch(() => undefined);
        }
      }
      for (const timer of retryTimers) {
        clearTimeout(timer);
      }
      retryTimers.clear();
    };
  }, [queryClient, scope]);
};
