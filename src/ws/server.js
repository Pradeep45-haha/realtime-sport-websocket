import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return;
  }
  return;
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
  return;
}

export function attachwss(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });
    socket.on("error", console.error);
  });

  function broadcastmatchcreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return broadcastmatchcreated;
}
