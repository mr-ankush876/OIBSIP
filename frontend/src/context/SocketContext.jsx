import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    // In dev / production, connect to window.location.origin or proxy
    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to live update server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: ${reason}`);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join_order_room', orderId);
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('leave_order_room', orderId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        leaveOrderRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
