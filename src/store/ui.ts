import { create } from 'zustand';
import { toast } from 'sonner';

interface UIState {
  sidebarOpen: boolean;
  detailPanelOpen: boolean;
  detailPanelTab: 'content' | 'sources' | 'history' | 'comments';
  detailPanelWidth: number;
  activeModal: string | null;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;
  slashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDetailPanel: () => void;
  setDetailPanelOpen: (open: boolean) => void;
  setDetailPanelTab: (tab: 'content' | 'sources' | 'history' | 'comments') => void;
  setDetailPanelWidth: (width: number) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  openSlashMenu: (position: { x: number; y: number }) => void;
  closeSlashMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  detailPanelOpen: false,
  detailPanelTab: 'content',
  detailPanelWidth: 400,
  activeModal: null,
  toasts: [],
  slashMenuOpen: false,
  slashMenuPosition: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  toggleDetailPanel: () => set((state) => ({
    detailPanelOpen: !state.detailPanelOpen,
  })),

  setDetailPanelOpen: (detailPanelOpen) => set({ detailPanelOpen }),
  setDetailPanelTab: (detailPanelTab) => set({ detailPanelTab }),
  setDetailPanelWidth: (detailPanelWidth) => set({ detailPanelWidth }),

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toastData) => {
    switch (toastData.type) {
      case 'success':
        toast.success(toastData.message);
        break;
      case 'error':
        toast.error(toastData.message);
        break;
      case 'warning':
        toast.warning(toastData.message);
        break;
      default:
        toast(toastData.message);
    }
    return set(() => ({ toasts: [] }));
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  openSlashMenu: (position) => set({
    slashMenuOpen: true,
    slashMenuPosition: position,
  }),

  closeSlashMenu: () => set({
    slashMenuOpen: false,
    slashMenuPosition: null,
  }),
}));
