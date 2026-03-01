import { create } from "zustand";
import type { BinLocationItemResponse } from "../services/binLocation";

type BinState = {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (nextState?: boolean) => void;
  qrModalData: BinLocationItemResponse | null;
  setQrModalData: (bin: BinLocationItemResponse | null) => void;
};

export const UseBinState = create<BinState>((set) => ({
  isAddModalOpen: false,
  qrModalData: null,
  setIsAddModalOpen: (nextState) =>
    set((state) => ({
      isAddModalOpen:
        typeof nextState === "boolean" ? nextState : !state.isAddModalOpen,
    })),
  setQrModalData: (bin) => set(() => ({ qrModalData: bin })),
}));
