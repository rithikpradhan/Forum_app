import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const createSocket = (): Socket => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    auth: {
      token: token,
    },
    forceNew: true, // Important for multi-tab support
  });
};
export const socket: Socket = createSocket();
