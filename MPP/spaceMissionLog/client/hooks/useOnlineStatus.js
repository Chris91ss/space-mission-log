import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function useOnlineStatus() {
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);
  const [serverOnline, setServerOnline] = useState(false);

  async function checkServer() {
    try {
      const res = await fetch(`${API_URL}/api/health`, { mode: "cors" });
      setServerOnline(res.ok);
    } catch (err) {
      setServerOnline(false);
    }
  }

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkOnline(navigator.onLine);
      checkServer();
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Initial check.
    updateNetworkStatus();
    const interval = setInterval(checkServer, 10000);

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      clearInterval(interval);
    };
  }, []);

  return networkOnline && serverOnline;
}
