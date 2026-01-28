import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://forum-backend-u97g.onrender.com";

export const createSocket = (): Socket => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  console.log("🔌 Creating socket with URL:", SOCKET_URL);
  console.log("🔑 Token present:", !!token);

  const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"], // CRITICAL: Try both transports
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10, // Increased for Render cold starts
    timeout: 20000, // CRITICAL: Longer timeout for Render cold starts
  });

  // Debug events
  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
    console.log("Transport:", socket.io.engine?.transport?.name);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnect attempt ${attemptNumber}`);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Reconnection failed after all attempts");
  });

  return socket;
};

export const socket: Socket = createSocket();
