import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export function Toast() {
  const notification = useNotificationStore((state) => state.notification);
  const hideNotification = useNotificationStore(
    (state) => state.hideNotification,
  );

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => {
      if (useNotificationStore.getState().notification === notification) {
        hideNotification();
      }
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [notification, hideNotification]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-20 flex justify-end"
    >
      {notification && (
        <p
          className={`max-w-sm rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium shadow-lg ${
            notification.kind === "error"
              ? "bg-error-surface text-danger"
              : "bg-accent-surface text-forest"
          }`}
        >
          {notification.message}
        </p>
      )}
    </div>
  );
}
