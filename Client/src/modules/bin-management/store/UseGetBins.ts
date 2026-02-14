import { create } from "zustand";

type INITIAL_BINS = {
  id: number;
  code: string;
  zone: string;
  capacity: number;
  current: number;
  status: string;
};
type BinsState = {
  NEW_INITIAL_BINS: INITIAL_BINS[];
};

export const UseGetBinState = create<BinsState>(() => ({
  NEW_INITIAL_BINS: [
    {
      id: 1,
      code: "A-01-01",
      zone: "Zone A (High Velocity)",
      capacity: 50,
      current: 45,
      status: "Active",
    },
    {
      id: 2,
      code: "A-01-02",
      zone: "Zone A (High Velocity)",
      capacity: 50,
      current: 12,
      status: "Active",
    },
    {
      id: 3,
      code: "B-02-05",
      zone: "Zone B (Bulk Storage)",
      capacity: 100,
      current: 0,
      status: "Maintenance",
    },
    {
      id: 4,
      code: "C-05-12",
      zone: "Zone C (Returns)",
      capacity: 30,
      current: 30,
      status: "Active",
    },
    {
      id: 5,
      code: "D-01-01",
      zone: "Zone D (Secure Cage)",
      capacity: 20,
      current: 5,
      status: "Active",
    },
  ],
}));
