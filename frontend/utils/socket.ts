import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token?: string): Socket => {
  const storedToken = token || localStorage.getItem("token");

  if (!storedToken) {
    throw new Error("No token provided for socket connection");
  }

  if (socket && socket.connected && currentToken === storedToken) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io("https://crm-project-backend-2fe2.onrender.com", {
    transports: ["websocket"], // You can add polling as fallback if needed
    auth: {
      token: storedToken,
    },
    reconnection: true, // optional, true by default
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  currentToken = storedToken;

  // 🔌 Basic connection status
  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    if (err.message !== "xhr poll error") {
      console.error("❌ Socket connection error:", err.message);
    }
  });

  // 🔁 Reconnection tracking
  socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔁 Reconnecting... attempt #${attempt}`);
  });

  socket.on("reconnect", (attempt) => {
    console.log(`✅ Reconnected on attempt #${attempt}`);
  });

  socket.on("reconnect_failed", () => {
    console.log("❌ Failed to reconnect after max attempts");
  });

  return socket;
};

export { socket };
