import { create } from "zustand";

type ModalState = {
  isModalOpen: boolean;
  setModalOpen: () => void;
};

export const UseModalState = create<ModalState>((set) => ({
  isModalOpen: false,

  setModalOpen: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
}));
