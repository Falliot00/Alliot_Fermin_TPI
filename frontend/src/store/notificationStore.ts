import { create } from "zustand";

interface Notification {
  message: string;
  kind: "success" | "error";
}

interface NotificationState {
  notification: Notification | null;
  showNotification: (message: string, kind?: Notification["kind"]) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notification: null,
  showNotification: (message, kind = "success") =>
    set({ notification: { message, kind } }),
  hideNotification: () => set({ notification: null }),
}));
