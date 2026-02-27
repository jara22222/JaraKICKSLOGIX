import { create } from "zustand";

// ── Types ──────────────────────────────────────
export type IncomingShipment = {
  id: string;
  poRef: string;
  supplier: string;
  product: string;
  sku: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
  qty: number;
  dateSent: string;
  eta: string;
  status: "In Transit" | "Arrived" | "Accepted" | "Stored";
};

export type InboundReceipt = {
  id: string;
  poRef: string;
  product: string;
  sku: string;
  qty: number;
  receivedBy: { name: string; role: string; time: string };
  putawayBy: { name: string; role: string; time: string };
  location: { type: string; id: string };
  status: string;
};

export type InboundActivity = {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
};

type InboundState = {
  // Current role
  userRole: "inbound_coordinator" | "branch_manager";
  setUserRole: (role: "inbound_coordinator" | "branch_manager") => void;

  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Incoming shipments (from suppliers)
  incomingShipments: IncomingShipment[];

  // Processed receipts (receiving log)
  receipts: InboundReceipt[];

  // Activity log
  activityLog: InboundActivity[];

  // Accept modal
  acceptTarget: IncomingShipment | null;
  setAcceptTarget: (shipment: IncomingShipment | null) => void;

  // Accept shipment → auto-assign to bin
  acceptShipment: (shipmentId: string, binCode: string) => void;
};

export const useInboundStore = create<InboundState>((set) => ({
  // Default to inbound coordinator (can accept)
  userRole: "inbound_coordinator",
  setUserRole: (role) => set({ userRole: role }),

  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Incoming Shipments ──
  incomingShipments: [
    {
      id: "SHP-4401",
      poRef: "PO-2026-004",
      supplier: "Nike Global",
      product: "Air Jordan 1 Retro High OG",
      sku: "NK-AJ1-RET-001",
      size: "L",
      qty: 300,
      dateSent: "Feb 12, 2026",
      eta: "Feb 15, 2026",
      status: "Arrived",
    },
    {
      id: "SHP-4402",
      poRef: "PO-2026-005",
      supplier: "Adidas Originals",
      product: "Adidas Samba OG",
      sku: "AD-SAMBA-OG-44",
      size: "M",
      qty: 150,
      dateSent: "Feb 11, 2026",
      eta: "Feb 14, 2026",
      status: "Arrived",
    },
    {
      id: "SHP-4403",
      poRef: "PO-2026-006",
      supplier: "New Balance Inc.",
      product: "New Balance 550",
      sku: "NB-550-WHT-09",
      size: "S",
      qty: 200,
      dateSent: "Feb 13, 2026",
      eta: "Feb 17, 2026",
      status: "In Transit",
    },
    {
      id: "SHP-4404",
      poRef: "PO-2026-007",
      supplier: "Puma Logistics",
      product: "Puma Suede Classic XXI",
      sku: "PM-SC-XXI-BLK",
      size: "XL",
      qty: 120,
      dateSent: "Feb 14, 2026",
      eta: "Feb 18, 2026",
      status: "In Transit",
    },
    {
      id: "SHP-4405",
      poRef: "PO-2026-008",
      supplier: "Nike Global",
      product: "Nike Dunk Low Panda",
      sku: "NK-DUNK-PND-10",
      size: "M",
      qty: 500,
      dateSent: "Feb 10, 2026",
      eta: "Feb 14, 2026",
      status: "Arrived",
    },
  ],

  // ── Receiving Log (processed) ──
  receipts: [
    {
      id: "RCPT-8821",
      poRef: "PO-2026-001",
      product: "Air Jordan 1 High",
      sku: "NK-AIR-001",
      qty: 50,
      receivedBy: { name: "LeBron James", role: "Inbound Clerk", time: "08:15 AM" },
      putawayBy: { name: "LeBron James", role: "Inbound Clerk", time: "08:30 AM" },
      location: { type: "Fixed-Bin", id: "A-01-05" },
      status: "Stored",
    },
    {
      id: "RCPT-8822",
      poRef: "PO-2026-001",
      product: "Nike Dunk Low",
      sku: "NK-DUNK-044",
      qty: 100,
      receivedBy: { name: "LeBron James", role: "Inbound Clerk", time: "08:45 AM" },
      putawayBy: { name: "Kevin Durant", role: "VAS / Handler", time: "09:10 AM" },
      location: { type: "Overflow", id: "Z-99-01" },
      status: "Flagged",
    },
    {
      id: "RCPT-8823",
      poRef: "PO-2026-002",
      product: "Adidas Ultraboost",
      sku: "AD-UB-22",
      qty: 200,
      receivedBy: { name: "Stephen Curry", role: "Inbound Clerk", time: "10:00 AM" },
      putawayBy: { name: "Pending", role: "-", time: "-" },
      location: { type: "Staging", id: "Dock-02" },
      status: "Receiving",
    },
    {
      id: "RCPT-8824",
      poRef: "PO-2026-003",
      product: "Puma RS-X",
      sku: "PM-RSX-009",
      qty: 75,
      receivedBy: { name: "Stephen Curry", role: "Inbound Clerk", time: "11:20 AM" },
      putawayBy: { name: "Stephen Curry", role: "Inbound Clerk", time: "11:35 AM" },
      location: { type: "Fixed-Bin", id: "C-05-01" },
      status: "Stored",
    },
  ],

  // ── Activity Log ──
  activityLog: [
    {
      id: "ACT-001",
      user: "LeBron James",
      action: "ACCEPT",
      description: "Accepted SHP-4400 — 50x Air Jordan 1 High → assigned to Bin A-01-05",
      timestamp: "Feb 14, 2026 08:15 AM",
    },
    {
      id: "ACT-002",
      user: "LeBron James",
      action: "PUT_AWAY",
      description: "Completed put-away for RCPT-8821 — 50 units stored at A-01-05",
      timestamp: "Feb 14, 2026 08:30 AM",
    },
    {
      id: "ACT-003",
      user: "LeBron James",
      action: "ACCEPT",
      description: "Accepted SHP-4399 — 100x Nike Dunk Low → overflow Z-99-01 (flagged)",
      timestamp: "Feb 14, 2026 08:45 AM",
    },
    {
      id: "ACT-004",
      user: "Kevin Durant",
      action: "PUT_AWAY",
      description: "Put-away RCPT-8822 — 100 units to overflow bin Z-99-01",
      timestamp: "Feb 14, 2026 09:10 AM",
    },
    {
      id: "ACT-005",
      user: "Stephen Curry",
      action: "ACCEPT",
      description: "Accepted SHP-4398 — 200x Adidas Ultraboost → staging at Dock-02",
      timestamp: "Feb 14, 2026 10:00 AM",
    },
    {
      id: "ACT-006",
      user: "System",
      action: "ALERT",
      description: "Low bin capacity warning — Zone A bins at 90% utilization",
      timestamp: "Feb 14, 2026 10:15 AM",
    },
    {
      id: "ACT-007",
      user: "Stephen Curry",
      action: "ACCEPT",
      description: "Accepted SHP-4397 — 75x Puma RS-X → assigned to Bin C-05-01",
      timestamp: "Feb 14, 2026 11:20 AM",
    },
    {
      id: "ACT-008",
      user: "Stephen Curry",
      action: "PUT_AWAY",
      description: "Completed put-away for RCPT-8824 — 75 units stored at C-05-01",
      timestamp: "Feb 14, 2026 11:35 AM",
    },
  ],

  // Accept modal
  acceptTarget: null,
  setAcceptTarget: (shipment) => set({ acceptTarget: shipment }),

  // Accept & auto-assign
  acceptShipment: (shipmentId, binCode) =>
    set((state) => {
      const shipment = state.incomingShipments.find((s) => s.id === shipmentId);
      if (!shipment) return state;

      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = now.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      // Create receipt
      const receiptId = `RCPT-${8825 + state.receipts.length}`;
      const newReceipt: InboundReceipt = {
        id: receiptId,
        poRef: shipment.poRef,
        product: shipment.product,
        sku: shipment.sku,
        qty: shipment.qty,
        receivedBy: { name: "LeBron James", role: "Inbound Clerk", time: timeStr },
        putawayBy: { name: "LeBron James", role: "Inbound Clerk", time: timeStr },
        location: { type: "Fixed-Bin", id: binCode },
        status: "Stored",
      };

      // Create activity entry
      const newActivity: InboundActivity = {
        id: `ACT-${String(state.activityLog.length + 1).padStart(3, "0")}`,
        user: "LeBron James",
        action: "ACCEPT",
        description: `Accepted ${shipment.id} — ${shipment.qty}x ${shipment.product} → assigned to Bin ${binCode}`,
        timestamp: `${dateStr} ${timeStr}`,
      };

      return {
        incomingShipments: state.incomingShipments.map((s) =>
          s.id === shipmentId ? { ...s, status: "Accepted" as const } : s
        ),
        receipts: [newReceipt, ...state.receipts],
        activityLog: [newActivity, ...state.activityLog],
        acceptTarget: null,
      };
    }),
}));
