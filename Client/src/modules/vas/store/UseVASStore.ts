import { create } from "zustand";

// ── Types ──────────────────────────────────────
export type VASItem = {
  id: string;
  orderRef: string;
  product: string;
  sku: string;
  qty: number;
  customer: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  courier: {
    name: string;
    trackingNumber: string;
    transactionId: string;
    deliveryGuy: string;
    estimatedDelivery: string;
  };
  handedOffBy: string; // outbound person who delivered the item
  status: "In Transit" | "Received" | "Processing" | "Completed";
  receivedAt: string | null;
  completedAt: string | null;
  notes: string;
};

export type VASActivity = {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
};

type VASState = {
  items: VASItem[];
  activityLog: VASActivity[];

  // Actions
  confirmReceipt: (itemId: string) => void;
  startProcessing: (itemId: string) => void;
  markComplete: (itemId: string) => void;
};

// ── Mock Data ──────────────────────────────────
const MOCK_VAS_ITEMS: VASItem[] = [
  {
    id: "VAS-001",
    orderRef: "ORD-5510",
    product: "Air Jordan 1 High OG",
    sku: "NK-AJ1-001",
    qty: 1,
    customer: {
      name: "Juan Dela Cruz",
      address: "123 Rizal St, Makati City, Metro Manila 1200",
      phone: "+63 917 123 4567",
      email: "juan@email.com",
    },
    courier: {
      name: "J&T Express",
      trackingNumber: "JT-PH-78901234567",
      transactionId: "TXN-20260214-0830",
      deliveryGuy: "Mark Reyes",
      estimatedDelivery: "2026-02-16",
    },
    handedOffBy: "Jara Joaquin",
    status: "In Transit",
    receivedAt: null,
    completedAt: null,
    notes: "",
  },
  {
    id: "VAS-002",
    orderRef: "ORD-5511",
    product: "Nike Dunk Low Panda",
    sku: "NK-DUNK-044",
    qty: 2,
    customer: {
      name: "Maria Santos",
      address: "456 Bonifacio Ave, Taguig City, Metro Manila 1630",
      phone: "+63 918 234 5678",
      email: "maria.santos@email.com",
    },
    courier: {
      name: "LBC Express",
      trackingNumber: "LBC-2026-55443322",
      transactionId: "TXN-20260214-0915",
      deliveryGuy: "Carlos Mendoza",
      estimatedDelivery: "2026-02-17",
    },
    handedOffBy: "Jara Joaquin",
    status: "In Transit",
    receivedAt: null,
    completedAt: null,
    notes: "",
  },
  {
    id: "VAS-003",
    orderRef: "ORD-5512",
    product: "Adidas Ultraboost 22",
    sku: "AD-UB-22",
    qty: 1,
    customer: {
      name: "Pedro Reyes",
      address: "789 Mabini Rd, Quezon City, Metro Manila 1100",
      phone: "+63 919 345 6789",
      email: "pedro.r@email.com",
    },
    courier: {
      name: "Flash Express",
      trackingNumber: "FE-PH-11223344556",
      transactionId: "TXN-20260214-0945",
      deliveryGuy: "Antonio Cruz",
      estimatedDelivery: "2026-02-15",
    },
    handedOffBy: "Kobe Bryant",
    status: "Received",
    receivedAt: "2026-02-14 10:30 AM",
    completedAt: null,
    notes: "",
  },
  {
    id: "VAS-004",
    orderRef: "ORD-5514",
    product: "Nike Air Max 90",
    sku: "NK-AM90-BW",
    qty: 1,
    customer: {
      name: "Carlo Mendoza",
      address: "321 Luna St, Pasig City, Metro Manila 1600",
      phone: "+63 920 456 7890",
      email: "carlo.m@email.com",
    },
    courier: {
      name: "Ninja Van",
      trackingNumber: "NV-PH-99887766554",
      transactionId: "TXN-20260214-0700",
      deliveryGuy: "Jose Garcia",
      estimatedDelivery: "2026-02-15",
    },
    handedOffBy: "Jara Joaquin",
    status: "Processing",
    receivedAt: "2026-02-14 08:00 AM",
    completedAt: null,
    notes: "Special gift wrapping requested",
  },
  {
    id: "VAS-005",
    orderRef: "ORD-5515",
    product: "Adidas Samba OG",
    sku: "AD-SMB-OG",
    qty: 3,
    customer: {
      name: "Rosa Aquino",
      address: "654 Aguinaldo Blvd, Cavite City, Cavite 4100",
      phone: "+63 921 567 8901",
      email: "rosa.a@email.com",
    },
    courier: {
      name: "J&T Express",
      trackingNumber: "JT-PH-11122233344",
      transactionId: "TXN-20260214-0800",
      deliveryGuy: "Mark Reyes",
      estimatedDelivery: "2026-02-16",
    },
    handedOffBy: "Kobe Bryant",
    status: "Completed",
    receivedAt: "2026-02-14 08:30 AM",
    completedAt: "2026-02-14 09:45 AM",
    notes: "",
  },
  {
    id: "VAS-006",
    orderRef: "ORD-5516",
    product: "Puma RS-X",
    sku: "PM-RSX-009",
    qty: 1,
    customer: {
      name: "Ana Garcia",
      address: "987 Osmena Hwy, Cebu City, Cebu 6000",
      phone: "+63 922 678 9012",
      email: "ana.garcia@email.com",
    },
    courier: {
      name: "LBC Express",
      trackingNumber: "LBC-2026-66778899",
      transactionId: "TXN-20260214-1000",
      deliveryGuy: "Carlos Mendoza",
      estimatedDelivery: "2026-02-18",
    },
    handedOffBy: "Jara Joaquin",
    status: "Completed",
    receivedAt: "2026-02-13 02:00 PM",
    completedAt: "2026-02-13 03:30 PM",
    notes: "Quality check passed",
  },
];

const MOCK_ACTIVITY: VASActivity[] = [
  { id: "VA-001", user: "Lebron James", action: "Received", description: "Received Adidas Ultraboost 22 (ORD-5512) from Kobe Bryant", timestamp: "2026-02-14 10:30 AM" },
  { id: "VA-002", user: "Lebron James", action: "Processing", description: "Started processing Nike Air Max 90 (ORD-5514) — special gift wrapping", timestamp: "2026-02-14 08:15 AM" },
  { id: "VA-003", user: "Lebron James", action: "Completed", description: "Completed VAS for Adidas Samba OG (ORD-5515) — ready for dispatch", timestamp: "2026-02-14 09:45 AM" },
  { id: "VA-004", user: "Lebron James", action: "Completed", description: "Completed VAS for Puma RS-X (ORD-5516) — quality check passed", timestamp: "2026-02-13 03:30 PM" },
  { id: "VA-005", user: "Lebron James", action: "Printed", description: "Printed shipping label for ORD-5515 — J&T Express (JT-PH-11122233344)", timestamp: "2026-02-14 09:50 AM" },
  { id: "VA-006", user: "Lebron James", action: "Received", description: "Received Nike Air Max 90 (ORD-5514) from Jara Joaquin", timestamp: "2026-02-14 08:00 AM" },
];

// ── Store ──────────────────────────────────────
export const useVASStore = create<VASState>((set, get) => ({
  items: MOCK_VAS_ITEMS,
  activityLog: MOCK_ACTIVITY,

  confirmReceipt: (itemId) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    const now = new Date().toLocaleString();

    const newActivity: VASActivity = {
      id: `VA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
      user: "Lebron James",
      action: "Received",
      description: `Received ${item.product} (${item.orderRef}) from ${item.handedOffBy}`,
      timestamp: now,
    };

    set({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, status: "Received", receivedAt: now } : i
      ),
      activityLog: [newActivity, ...state.activityLog],
    });
  },

  startProcessing: (itemId) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    const now = new Date().toLocaleString();

    const newActivity: VASActivity = {
      id: `VA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
      user: "Lebron James",
      action: "Processing",
      description: `Started processing ${item.product} (${item.orderRef})`,
      timestamp: now,
    };

    set({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, status: "Processing" } : i
      ),
      activityLog: [newActivity, ...state.activityLog],
    });
  },

  markComplete: (itemId) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    const now = new Date().toLocaleString();

    const newActivity: VASActivity = {
      id: `VA-${String(state.activityLog.length + 1).padStart(3, "0")}`,
      user: "Lebron James",
      action: "Completed",
      description: `Completed VAS for ${item.product} (${item.orderRef}) — ready for dispatch`,
      timestamp: now,
    };

    set({
      items: state.items.map((i) =>
        i.id === itemId
          ? { ...i, status: "Completed", completedAt: now }
          : i
      ),
      activityLog: [newActivity, ...state.activityLog],
    });
  },
}));
