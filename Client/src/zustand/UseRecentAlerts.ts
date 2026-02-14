import { create } from "zustand";

type RECENT_ALERTS = {
  id: number;
  type: string;
  msg: string;
  time: string;
};

type RecentAlerts = {
  recentAlerts: RECENT_ALERTS[];
};

export const useRecentAlerts = create<RecentAlerts>(() => ({
  recentAlerts: [
    {
      id: 1,
      type: "Critical",
      msg: "Low Stock: Air Jordan 1 High (Red) below threshold.",
      time: "10m ago",
    },
    {
      id: 2,
      type: "Warning",
      msg: "Delay: Inbound Shipment #REP-005 is 2h late.",
      time: "45m ago",
    },
  ],
}));
