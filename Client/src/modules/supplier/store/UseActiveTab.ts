import { create } from "zustand";

type TabState = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const useTabState = create<TabState>((set) => ({
  activeTab: "orders",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
