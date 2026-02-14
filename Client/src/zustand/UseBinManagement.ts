import { create } from "zustand";
type INITIAL_BINS = {
  id: number;
  code: string;
  zone: string;
  capacity: number;
  current: number;
  status: string;
};
type BinState = {
  isAddModalOpen: boolean;
  setIsAddModalOpen: () => void;
  qrModalData: any;
  setQrModalData: (INITIAL_BIN: INITIAL_BINS[] | null) => void;
};

export const UseBinState = create<BinState>((set) => ({
  isAddModalOpen: false,
  qrModalData: null,
  setIsAddModalOpen: () =>
    set((state) => ({ isAddModalOpen: !state.isAddModalOpen })),
  setQrModalData: (INITIAL_BIN) => set(() => ({ qrModalData: INITIAL_BIN })),
}));
