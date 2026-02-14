import { create } from "zustand";
type Partner = {
  id: number;
  name: string;
  contact: string;
  email: string;
  activeOrders: number;
  rating: number;
  status: string;
};

type PartnerState = {
  partner: Partner[];
};

export const UsePartnerState = create<PartnerState>(() => ({
  partner: [
    {
      id: 1,
      name: "Nike Global",
      contact: "Sarah Connors",
      email: "supply@nike.com",
      activeOrders: 3,
      rating: 4.9,
      status: "Active",
    },
    {
      id: 2,
      name: "Adidas Originals",
      contact: "Gary Vee",
      email: "b2b@adidas.com",
      activeOrders: 1,
      rating: 4.7,
      status: "Active",
    },
    {
      id: 3,
      name: "Puma Logistics",
      contact: "Usain Bolt",
      email: "orders@puma.com",
      activeOrders: 0,
      rating: 4.5,
      status: "Review",
    },
    {
      id: 4,
      name: "Puma Logistics",
      contact: "Usain Bolt",
      email: "orders@puma.com",
      activeOrders: 0,
      rating: 4.5,
      status: "Review",
    },
    {
      id: 5,
      name: "Puma Logistics",
      contact: "Usain Bolt",
      email: "orders@puma.com",
      activeOrders: 0,
      rating: 4.5,
      status: "Review",
    },
    {
      id: 6,
      name: "Puma Logistics",
      contact: "Usain Bolt",
      email: "orders@puma.com",
      activeOrders: 0,
      rating: 4.5,
      status: "Review",
    },
  ],
}));
