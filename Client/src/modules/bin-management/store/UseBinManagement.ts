import { create } from "zustand";
import type { BinLocationItemResponse } from "../services/binLocation";

type BinState = {
  isAddModalOpen: boolean;
  setIsAddModalOpen: () => void;
  qrModalData: BinLocationItemResponse | null;
  setQrModalData: (bin: BinLocationItemResponse | null) => void;
};

export const UseBinState = create<BinState>((set) => ({
  isAddModalOpen: false,
  qrModalData: null,
  setIsAddModalOpen: () =>
    set((state) => ({ isAddModalOpen: !state.isAddModalOpen })),
  setQrModalData: (bin) => set(() => ({ qrModalData: bin })),
}));
