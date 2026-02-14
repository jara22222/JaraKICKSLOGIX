import { create } from "zustand";

// --- TYPES ---
export type Branch = {
  id: number;
  name: string;
  location: string;
};

export type Manager = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  branch: string;
  status: string;
  createdAt: string;
};

export type Supplier = {
  id: number;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  agreement: boolean;
  status: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  branch: string;
  datePerformed: string;
};

type SuperAdminState = {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Manager modal (create/edit)
  isManagerModalOpen: boolean;
  toggleManagerModal: () => void;
  editingManager: Manager | null;
  openEditManager: (manager: Manager) => void;
  closeManagerModal: () => void;

  // Manager CRUD
  updateManager: (id: number, data: Partial<Manager>) => void;
  archiveManager: (id: number) => void;

  // Archive confirmation
  archiveConfirmManager: Manager | null;
  setArchiveConfirmManager: (manager: Manager | null) => void;

  // Supplier modal (create/edit)
  isSupplierModalOpen: boolean;
  toggleSupplierModal: () => void;
  editingSupplier: Supplier | null;
  openEditSupplier: (supplier: Supplier) => void;
  closeSupplierModal: () => void;

  // Supplier CRUD
  updateSupplier: (id: number, data: Partial<Supplier>) => void;
  archiveSupplier: (id: number) => void;

  // Data
  branches: Branch[];
  managers: Manager[];
  suppliers: Supplier[];
  auditLogs: AuditLog[];
};

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Manager modal
  isManagerModalOpen: false,
  editingManager: null,
  toggleManagerModal: () =>
    set((state) => ({
      isManagerModalOpen: !state.isManagerModalOpen,
      editingManager: state.isManagerModalOpen ? null : state.editingManager,
    })),
  openEditManager: (manager) =>
    set({ editingManager: manager, isManagerModalOpen: true }),
  closeManagerModal: () =>
    set({ isManagerModalOpen: false, editingManager: null }),

  // Manager CRUD
  updateManager: (id, data) =>
    set((state) => ({
      managers: state.managers.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    })),
  archiveManager: (id) =>
    set((state) => ({
      managers: state.managers.map((m) =>
        m.id === id ? { ...m, status: "Archived" } : m
      ),
      archiveConfirmManager: null,
    })),

  // Archive confirmation
  archiveConfirmManager: null,
  setArchiveConfirmManager: (manager) =>
    set({ archiveConfirmManager: manager }),

  // Supplier modal
  isSupplierModalOpen: false,
  editingSupplier: null,
  toggleSupplierModal: () =>
    set((state) => ({
      isSupplierModalOpen: !state.isSupplierModalOpen,
      editingSupplier: state.isSupplierModalOpen ? null : state.editingSupplier,
    })),
  openEditSupplier: (supplier) =>
    set({ editingSupplier: supplier, isSupplierModalOpen: true }),
  closeSupplierModal: () =>
    set({ isSupplierModalOpen: false, editingSupplier: null }),

  // Supplier CRUD
  updateSupplier: (id, data) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),
  archiveSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, status: "Archived" } : s
      ),
    })),

  branches: [
    { id: 1, name: "Davao Main Hub", location: "Davao City, Davao del Sur" },
    { id: 2, name: "Tagum Branch", location: "Tagum City, Davao del Norte" },
    { id: 3, name: "GenSan Warehouse", location: "General Santos City" },
  ],

  managers: [
    {
      id: 1,
      firstName: "Michael",
      middleName: "Jeffrey",
      lastName: "Jordan",
      email: "mj@kickslogix.com",
      branch: "Davao Main Hub",
      status: "Active",
      createdAt: "Jan 15, 2026",
    },
    {
      id: 2,
      firstName: "Tim",
      middleName: "Theodore",
      lastName: "Duncan",
      email: "td@kickslogix.com",
      branch: "Tagum Branch",
      status: "Active",
      createdAt: "Jan 20, 2026",
    },
    {
      id: 3,
      firstName: "Earvin",
      middleName: "Magic",
      lastName: "Johnson",
      email: "magic@kickslogix.com",
      branch: "GenSan Warehouse",
      status: "Inactive",
      createdAt: "Feb 01, 2026",
    },
  ],

  suppliers: [
    {
      id: 1,
      companyName: "Nike Global",
      companyAddress: "Nike HQ, Beaverton, Oregon",
      contactPerson: "Sarah Connors",
      email: "supply@nike.com",
      agreement: true,
      status: "Active",
      createdAt: "Jan 10, 2026",
    },
    {
      id: 2,
      companyName: "Adidas Originals",
      companyAddress: "Herzogenaurach, Germany",
      contactPerson: "Gary Vee",
      email: "b2b@adidas.com",
      agreement: true,
      status: "Active",
      createdAt: "Jan 12, 2026",
    },
    {
      id: 3,
      companyName: "Puma Logistics",
      companyAddress: "Puma Way, Somerville, MA",
      contactPerson: "Usain Bolt",
      email: "orders@puma.com",
      agreement: false,
      status: "Pending",
      createdAt: "Feb 05, 2026",
    },
    {
      id: 4,
      companyName: "New Balance Inc.",
      companyAddress: "Boston, Massachusetts",
      contactPerson: "Kawhi Leonard",
      email: "partners@nb.com",
      agreement: true,
      status: "Active",
      createdAt: "Feb 08, 2026",
    },
  ],

  auditLogs: [
    {
      id: "LOG-001",
      userId: "SA-001",
      userName: "Jara Joaquin",
      action: "CREATE_MANAGER",
      description:
        "Created manager account for Michael Jordan — assigned to Davao Main Hub",
      branch: "Davao Main Hub",
      datePerformed: "Feb 14, 2026 09:15 AM",
    },
    {
      id: "LOG-002",
      userId: "MGR-001",
      userName: "Michael Jordan",
      action: "CREATE_STAFF",
      description:
        "Created staff account for LeBron James (Inbound Coordinator)",
      branch: "Davao Main Hub",
      datePerformed: "Feb 14, 2026 09:30 AM",
    },
    {
      id: "LOG-003",
      userId: "INB-001",
      userName: "LeBron James",
      action: "RECEIVE",
      description:
        "Received PO-2026-001 — 500 units Nike Air Jordan 1 High",
      branch: "Davao Main Hub",
      datePerformed: "Feb 14, 2026 10:00 AM",
    },
    {
      id: "LOG-004",
      userId: "INB-001",
      userName: "LeBron James",
      action: "PUT_AWAY",
      description:
        "Put away 500 units to Bin A-01-05 (Fixed-Bin, FIFO enforced)",
      branch: "Davao Main Hub",
      datePerformed: "Feb 14, 2026 10:20 AM",
    },
    {
      id: "LOG-005",
      userId: "OUT-001",
      userName: "Kobe Bryant",
      action: "PICK",
      description:
        "Picked 2x Adidas Ultraboost from Bin C-05-02 for ORD-5502",
      branch: "Tagum Branch",
      datePerformed: "Feb 14, 2026 10:45 AM",
    },
    {
      id: "LOG-006",
      userId: "OUT-001",
      userName: "Kobe Bryant",
      action: "DISPATCH",
      description:
        "Dispatched ORD-5502 via J&T Express — Transit ID: JT-88412",
      branch: "Tagum Branch",
      datePerformed: "Feb 14, 2026 11:00 AM",
    },
    {
      id: "LOG-007",
      userId: "SYS",
      userName: "System",
      action: "ALERT",
      description:
        "Low stock threshold triggered — Air Jordan 1 High (Red) below 10 units",
      branch: "Davao Main Hub",
      datePerformed: "Feb 14, 2026 11:15 AM",
    },
    {
      id: "LOG-008",
      userId: "MGR-002",
      userName: "Tim Duncan",
      action: "APPROVE",
      description:
        "Approved replenishment request REP-012 for Nike Dunk Low (200 units)",
      branch: "Tagum Branch",
      datePerformed: "Feb 13, 2026 03:00 PM",
    },
    {
      id: "LOG-009",
      userId: "VAS-001",
      userName: "Stephen Curry",
      action: "PACK",
      description:
        "Completed VAS packaging for ORD-5505 — gift bundle with receipt label",
      branch: "GenSan Warehouse",
      datePerformed: "Feb 13, 2026 02:15 PM",
    },
    {
      id: "LOG-010",
      userId: "SA-001",
      userName: "Jara Joaquin",
      action: "REGISTER_SUPPLIER",
      description:
        "Registered new supplier: New Balance Inc. — Agreement signed",
      branch: "All Branches",
      datePerformed: "Feb 08, 2026 10:00 AM",
    },
  ],
}));
