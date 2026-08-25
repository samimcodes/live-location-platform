import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/socket.io',
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  const s = getSocket();
  const prev = (s.auth as { token?: string } | undefined)?.token;
  s.auth = { token };
  if (s.connected && prev !== token) {
    s.disconnect();
    s.connect();
  } else if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
  // Always null the singleton so the next connectSocket call creates a fresh
  // instance with the correct auth token rather than reusing a stale one.
  socket = null;
};
