'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { inventoryKeys } from '@/features/inventory/hooks/use-inventory';
import { catalogKeys } from '@/features/catalog/hooks/use-categories';

export interface RealtimeContextType {
  isConnected: boolean;
  lastEvent: unknown | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<unknown | null>(null);

  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const socket: Socket = io(`${socketUrl}/realtime`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      queryClient.invalidateQueries({ refetchType: 'active' });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on(
      'realtime:event',
      (event: { resource?: string; action?: string; branchId?: string | null; [key: string]: unknown }) => {
        if (event?.resource === 'inventory') {
          queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
        } else if (event?.resource === 'catalog') {
          queryClient.invalidateQueries({ queryKey: catalogKeys.all });
        }
        setLastEvent(event);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, queryClient]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
