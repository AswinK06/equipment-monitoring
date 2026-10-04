import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { API } from "../api/client";

export function useSignalR({
  onReadingsReceived,
  onAlertTriggered,
  onAlertUpdated,
  accessTokenFactory,
}) {
  const [isLive, setIsLive] = useState(false);
  const handlersRef = useRef({ onReadingsReceived, onAlertTriggered, onAlertUpdated });

  useEffect(() => {
    handlersRef.current = { onReadingsReceived, onAlertTriggered, onAlertUpdated };
  });

  useEffect(() => {
    if (!accessTokenFactory) {
      return;
    }

    let isCancelled = false;
    let retryTimeoutId = null;

    const builder = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/equipment`, {
        accessTokenFactory,
      })
      .withAutomaticReconnect();

    const connection = builder.build();

    connection.on("ReadingsReceived", (data) => {
      handlersRef.current.onReadingsReceived?.(data);
    });

    connection.on("AlertTriggered", (data) => {
      handlersRef.current.onAlertTriggered?.(data);
    });

    connection.on("AlertUpdated", (data) => {
      handlersRef.current.onAlertUpdated?.(data);
    });

    connection.onreconnecting(() => setIsLive(false));
    connection.onreconnected(() => setIsLive(true));

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isCancelled) setIsLive(true);
      } catch {
        if (!isCancelled) {
          retryTimeoutId = setTimeout(startConnection, 3000);
        }
      }
    };

    connection.onclose(() => {
      if (!isCancelled) {
        setIsLive(false);
        retryTimeoutId = setTimeout(startConnection, 3000);
      }
    });

    startConnection();

    return () => {
      isCancelled = true;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      connection.stop();
    };
  }, [accessTokenFactory]);

  return { isLive };
}
