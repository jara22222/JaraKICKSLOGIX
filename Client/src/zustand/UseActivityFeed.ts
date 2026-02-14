import { create } from "zustand";

type ACTIVITY_FEED = {
  user: string;
  action: string;
  time: string;
  role: string;
};

type ActivityFeed = {
  activityFeed: ACTIVITY_FEED[];
};

export const UseActivityFeed = create<ActivityFeed>(() => ({
  activityFeed: [
    {
      user: "LeBron J.",
      action: "received PO-2026-001",
      time: "09:15 AM",
      role: "Inbound",
    },
    {
      user: "Kobe B.",
      action: "dispatched ORD-5502",
      time: "09:30 AM",
      role: "Outbound",
    },
    {
      user: "Jara J.",
      action: "approved New Balance",
      time: "10:00 AM",
      role: "Admin",
    },
  ],
}));
