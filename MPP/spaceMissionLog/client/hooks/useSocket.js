// client/hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

export default function useSocket() {
  const [socketData, setSocketData] = useState(null);
  const socket = io(process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    socket.on('missionUpdate', (data) => {
      setSocketData(data);
    });
    return () => {
      socket.off('missionUpdate');
      socket.disconnect();
    };
  }, [socket]);

  return socketData;
}
