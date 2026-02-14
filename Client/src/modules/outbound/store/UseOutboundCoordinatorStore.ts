import { create } from "zustand";

// ── Types ──────────────────────────────────────
export type BinProduct = {
  id: string;
  product: string;
  sku: string;
  qty: number;
  binCode: string;
  zone: string;
  dateStored: string;
};

export type PickRequest = {
  id: string;
  orderRef: string;
  product: string;
  sku: string;
  qtyRequested: number;
  binCode: string;
  zone: string;
  priority: "Urgent" | "Normal" | "Low";
  status: "Pending" | "Located" | "Picked" | "Confirmed";
  requestedAt: string;
  customer: string;
};

export type ReassignmentLog = {
  id: string;
  product: string;
  sku: string;
  fromBin: string;
  toBin: string;
  reason: string;
  performedBy: string;
  timestamp: string;
};

export type OutboundActivity = {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
};

type OutboundCoordinatorState = {
  // Bin inventory (for scanning/reassignment)
  binProducts: BinProduct[];

  // Pick requests from orders
  pickRequests: PickRequest[];

  // Reassignment history
  reassignments: ReassignmentLog[];

  // Activity log
  activityLog: OutboundActivity[];

  // ── Actions ──
  // Scan & reassign: swap the bin locations of two products
  reassignBins: (productIdA: string, productIdB: string, reason: string) => void;

  // Pick request: mark as located
  markLocated: (requestId: string) => void;

  // Pick request: confirm pick via scan
  confirmPick: (requestId: string) => void;
};

// ── Mock Data ──────────────────────────────────
const MOCK_BIN_PRODUCTS: BinProduct[] = [
  { id: "BP-001", product: "Air Jordan 1 High OG", sku: "NK-AJ1-001", qty: 12, binCode: "A-01-01", zone: "Zone A (Top)", dateStored: "2026-02-01" },
  { id: "BP-002", product: "Nike Dunk Low Panda", sku: "NK-DUNK-044", qty: 8, binCode: "A-01-05", zone: "Zone A (Top)", dateStored: "2026-01-15" },
  { id: "BP-003", product: "Adidas Ultraboost 22", sku: "AD-UB-22", qty: 15, binCode: "B-02-03", zone: "Zone B (Mid)", dateStored: "2026-01-20" },
  { id: "BP-004", product: "New Balance 550", sku: "NB-550-WG", qty: 6, binCode: "B-02-12", zone: "Zone B (Mid)", dateStored: "2026-02-05" },
  { id: "BP-005", product: "Puma RS-X", sku: "PM-RSX-009", qty: 10, binCode: "C-05-01", zone: "Zone C (Bottom)", dateStored: "2025-12-10" },
  { id: "BP-006", product: "Nike Air Max 90", sku: "NK-AM90-BW", qty: 4, binCode: "C-05-02", zone: "Zone C (Bottom)", dateStored: "2025-11-28" },
  { id: "BP-007", product: "Adidas Samba OG", sku: "AD-SMB-OG", qty: 20, binCode: "A-03-02", zone: "Zone A (Top)", dateStored: "2026-02-10" },
  { id: "BP-008", product: "Converse Chuck 70", sku: "CV-C70-BLK", qty: 9, binCode: "D-01-04", zone: "Zone D (Staging)", dateStored: "2026-02-12" },
];

const MOCK_PICK_REQUESTS: PickRequest[] = [
  { id: "REQ-4001", orderRef: "ORD-5510", product: "Air Jordan 1 High OG", sku: "NK-AJ1-001", qtyRequested: 1, binCode: "A-01-01", zone: "Zone A (Top)", priority: "Urgent", status: "Pending", requestedAt: "2026-02-14 08:30 AM", customer: "Juan Dela Cruz" },
  { id: "REQ-4002", orderRef: "ORD-5511", product: "Nike Dunk Low Panda", sku: "NK-DUNK-044", qtyRequested: 2, binCode: "A-01-05", zone: "Zone A (Top)", priority: "Normal", status: "Pending", requestedAt: "2026-02-14 09:15 AM", customer: "Maria Santos" },
  { id: "REQ-4003", orderRef: "ORD-5512", product: "Adidas Ultraboost 22", sku: "AD-UB-22", qtyRequested: 1, binCode: "B-02-03", zone: "Zone B (Mid)", priority: "Normal", status: "Located", requestedAt: "2026-02-14 09:45 AM", customer: "Pedro Reyes" },
  { id: "REQ-4004", orderRef: "ORD-5513", product: "Puma RS-X", sku: "PM-RSX-009", qtyRequested: 1, binCode: "C-05-01", zone: "Zone C (Bottom)", priority: "Low", status: "Pending", requestedAt: "2026-02-14 10:00 AM", customer: "Ana Garcia" },
  { id: "REQ-4005", orderRef: "ORD-5514", product: "Nike Air Max 90", sku: "NK-AM90-BW", qtyRequested: 1, binCode: "C-05-02", zone: "Zone C (Bottom)", priority: "Urgent", status: "Confirmed", requestedAt: "2026-02-14 07:00 AM", customer: "Carlo Mendoza" },
  { id: "REQ-4006", orderRef: "ORD-5515", product: "Adidas Samba OG", sku: "AD-SMB-OG", qtyRequested: 3, binCode: "A-03-02", zone: "Zone A (Top)", priority: "Normal", status: "Picked", requestedAt: "2026-02-14 08:00 AM", customer: "Rosa Aquino" },
];

const MOCK_REASSIGNMENTS: ReassignmentLog[] = [
  { id: "RA-001", product: "Nike Air Max 90", sku: "NK-AM90-BW", fromBin: "A-01-03", toBin: "C-05-02", reason: "FIFO rotation", performedBy: "Jara Joaquin", timestamp: "2026-02-13 03:15 PM" },
  { id: "RA-002", product: "Puma RS-X", sku: "PM-RSX-009", fromBin: "B-02-08", toBin: "C-05-01", reason: "FIFO rotation", performedBy: "Jara Joaquin", timestamp: "2026-02-12 11:00 AM" },
];

const MOCK_ACTIVITY: OutboundActivity[] = [
  { id: "OA-001", user: "Jara Joaquin", action: "Bin Reassign", description: "Swapped Nike Air Max 90 from A-01-03 → C-05-02 (FIFO)", timestamp: "2026-02-13 03:15 PM" },
  { id: "OA-002", user: "Jara Joaquin", action: "Pick Confirm", description: "Confirmed pick for ORD-5514 — Nike Air Max 90 (C-05-02)", timestamp: "2026-02-14 07:30 AM" },
  { id: "OA-003", user: "Jara Joaquin", action: "Located", description: "Located Adidas Ultraboost 22 at B-02-03 for ORD-5512", timestamp: "2026-02-14 10:05 AM" },
  { id: "OA-004", user: "Jara Joaquin", action: "Pick Confirm", description: "Confirmed pick for ORD-5515 — Adidas Samba OG (A-03-02)", timestamp: "2026-02-14 08:20 AM" },
  { id: "OA-005", user: "Jara Joaquin", action: "Bin Reassign", description: "Swapped Puma RS-X from B-02-08 → C-05-01 (FIFO)", timestamp: "2026-02-12 11:00 AM" },
];

// ── Store ──────────────────────────────────────
export const useOutboundCoordinatorStore = create<OutboundCoordinatorState>(
  (set, get) => ({
    binProducts: MOCK_BIN_PRODUCTS,
    pickRequests: MOCK_PICK_REQUESTS,
    reassignments: MOCK_REASSIGNMENTS,
    activityLog: MOCK_ACTIVITY,

    reassignBins: (productIdA, productIdB, reason) => {
      const state = get();
      const a = state.binProducts.find((p) => p.id === productIdA);
      const b = state.binProducts.find((p) => p.id === productIdB);
      if (!a || !b) return;

      const tempBin = a.binCode;
      const tempZone = a.zone;

      const newLog: ReassignmentLog = {
        id: `RA-${String(state.reassignments.length + 1).padStart(3, "0")}`,
        product: `${a.product} ↔ ${b.product}`,
        sku: `${a.sku} / ${b.sku}`,
        fromBin: `${a.binCode} / ${b.binCode}`,
        toBin: `${b.binCode} / ${a.binCode}`,
        reason,
        performedBy: "Jara Joaquin",
        timestamp: new Date().toLocaleString(),
      };

      const newActivity: OutboundActivity = {
        id: `OA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
        user: "Jara Joaquin",
        action: "Bin Reassign",
        description: `Swapped ${a.product} (${a.binCode}) ↔ ${b.product} (${b.binCode}) — ${reason}`,
        timestamp: new Date().toLocaleString(),
      };

      set({
        binProducts: state.binProducts.map((p) => {
          if (p.id === productIdA) return { ...p, binCode: b.binCode, zone: b.zone };
          if (p.id === productIdB) return { ...p, binCode: tempBin, zone: tempZone };
          return p;
        }),
        reassignments: [newLog, ...state.reassignments],
        activityLog: [newActivity, ...state.activityLog],
      });
    },

    markLocated: (requestId) => {
      const state = get();
      const req = state.pickRequests.find((r) => r.id === requestId);
      if (!req) return;

      const newActivity: OutboundActivity = {
        id: `OA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
        user: "Jara Joaquin",
        action: "Located",
        description: `Located ${req.product} at ${req.binCode} for ${req.orderRef}`,
        timestamp: new Date().toLocaleString(),
      };

      set({
        pickRequests: state.pickRequests.map((r) =>
          r.id === requestId ? { ...r, status: "Located" } : r
        ),
        activityLog: [newActivity, ...state.activityLog],
      });
    },

    confirmPick: (requestId) => {
      const state = get();
      const req = state.pickRequests.find((r) => r.id === requestId);
      if (!req) return;

      const newActivity: OutboundActivity = {
        id: `OA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
        user: "Jara Joaquin",
        action: "Pick Confirm",
        description: `Confirmed pick for ${req.orderRef} — ${req.product} (${req.binCode})`,
        timestamp: new Date().toLocaleString(),
      };

      set({
        pickRequests: state.pickRequests.map((r) =>
          r.id === requestId ? { ...r, status: "Confirmed" } : r
        ),
        activityLog: [newActivity, ...state.activityLog],
      });
    },
  })
);
