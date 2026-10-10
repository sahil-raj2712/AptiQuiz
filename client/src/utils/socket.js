import { io } from "socket.io-client";

// In dev, connect to port 4000; in production, connect to window.location.origin
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.port === "5173" ? "http://localhost:4000" : window.location.origin
);

export const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

// Periodic latency calculation to ensure network delay fairness
let currentPing = 45;

setInterval(() => {
  if (socket.connected) {
    const start = Date.now();
    socket.emit("heartbeat_ping", { clientTime: start });
  }
}, 8000);

socket.on("heartbeat_pong", ({ clientTime }) => {
  currentPing = Math.max(10, Date.now() - clientTime);
  const activeRoom = localStorage.getItem("aptiquiz_room_code");
  const playerId = localStorage.getItem("aptiquiz_player_id");
  if (activeRoom && playerId) {
    socket.emit("report_ping", { roomCode: activeRoom, playerId, ping: currentPing });
  }
});

export function getCurrentPing() {
  return currentPing;
}
