import { create } from "zustand";
type Orders = {
  id: string;
  partner: string;
  items: number;
  created: string;
  eta: string;
  status: string;
};

type OrdersState = {
  order: Orders[];
};

export const UseOrderState = create<OrdersState>(() => ({
  order: [
    {
      id: "PO-2026-001",
      partner: "Nike Global",
      items: 500,
      created: "Oct 24, 2026",
      eta: "Oct 28, 2026",
      status: "In Transit",
    },
    {
      id: "PO-2026-002",
      partner: "Adidas Originals",
      items: 250,
      created: "Oct 25, 2026",
      eta: "Nov 01, 2026",
      status: "Pending Approval",
    },
    {
      id: "PO-2026-003",
      partner: "Nike Global",
      items: 1200,
      created: "Oct 20, 2026",
      eta: "Oct 22, 2026",
      status: "Received",
    },
  ],
}));
