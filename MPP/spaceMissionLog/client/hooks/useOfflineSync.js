import { useEffect } from "react";
import useOnlineStatus from "./useOnlineStatus";
import { API_URL } from "../config";

export default function useOfflineSync() {
  const online = useOnlineStatus();

  useEffect(() => {
    if (online) {
      const pending = JSON.parse(localStorage.getItem("pendingOps") || "[]");
      if (pending.length > 0) {
        pending.forEach(async (op) => {
          try {
            const res = await fetch(`${API_URL}${op.endpoint}`, op.options);
            if (!res.ok) {
              console.error("Sync error: Operation failed", op);
            }
          } catch (err) {
            console.error("Sync error: Unable to send operation", op, err);
          }
        });
        localStorage.removeItem("pendingOps");
      }
    }
  }, [online]);

  const queueOperation = (endpoint, options) => {
    const pending = JSON.parse(localStorage.getItem("pendingOps") || "[]");
    pending.push({ endpoint, options });
    localStorage.setItem("pendingOps", JSON.stringify(pending));
  };

  return { online, queueOperation };
}
