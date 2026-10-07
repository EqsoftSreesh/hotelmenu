"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WS_BASE_URL } from "@/lib/constants";
import { useToast } from "@/components/common/Toast";

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({ isConnected: false });

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { info } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      // Connect to global menu broadcast channel
      const wsUrl = `${WS_BASE_URL}/menu/admin_live_channel`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data } = payload;

          if (eventName === "MENU_ITEM_AVAILABILITY_CHANGED") {
            queryClient.invalidateQueries({ queryKey: ["menu-items"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            const statusText = data.is_available ? "Available" : "OUT OF STOCK";
            info(
              `"${data.name || 'Menu item'}" is now marked as ${statusText}`,
              "Live Stock Update"
            );
          } else if (eventName === "MENU_ITEM_UPDATED" || eventName === "MENU_ITEM_CREATED" || eventName === "MENU_ITEM_DELETED") {
            queryClient.invalidateQueries({ queryKey: ["menu-items"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          } else if (eventName === "CATEGORY_UPDATED") {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          } else if (eventName === "BANNER_UPDATED") {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
          }
        } catch {
          // Non-JSON or heartbeat
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient, info]);

  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useLiveUpdates() {
  return useContext(WebSocketContext);
}
