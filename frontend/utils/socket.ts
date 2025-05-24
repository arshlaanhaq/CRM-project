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

  socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
      token: storedToken,
    },
  });

  currentToken = storedToken;

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  return socket;
};

// Export socket variable for direct access (might be null initially)
export { socket };
