import { useContext, useEffect } from 'react';
import { SocketContext, type SocketContextValue } from '../contexts/SocketContext';

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}

/** Subscribe to a socket event; auto-cleans up on unmount */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
