import { WebSocket, WebSocketServer } from "ws";

// todo
// add heartbeat

const matchSubscribers = new Map();

function subscribe(matchId, socket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}

function unSubscribe(matchId, socket) {
  const matchsubscriber = matchSubscribers.get(matchId);
  if (!matchsubscriber) {
    return;
  }

  matchsubscriber.delete(socket);
  if (matchsubscriber.size === 0) {
    matchSubscribers.delete(matchId);
  }
}

function cleanupSubscription(socket) {
  for (const matchId of socket.subsriptions) {
    unSubscribe(matchId);
  }
}

function broadcasttomatch(matchId, payload) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) {
    return;
  }
  const message = JSON.stringify(payload);
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function handleMessage(socket, data) {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch (error) {
    console.error(error);
    sendJson(socket, { type: "error", message: "Invalid JSON" });
  }

  if (message?.type === 'subscribe' && Number.isInteger(message.matchId)) {
    subscribe(message.matchId, socket);
    socket.subsriptions.add(message.matchId);
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
    return;
  }

  if (message?.type === 'unsubscribe' && Number.isInteger(message.matchId)) {
    unSubscribe(message.matchId, socket);
    socket.subsriptions.delete(message.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
    return;
  }
}

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return;
  }
  return;
}

function broadcastToAll(wss, payload) {
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
    socket.subsriptions = new Set();

    socket.on("message", (data) => {
      handleMessage(socket, data);
    });

    socket.on("error", () => {
      socket.terminate();
    });

    socket.on("close", () => {
      cleanupSubscription(socket);
    });

    sendJson(socket, { type: "welcome" });
    socket.on("error", console.error);
  });

  function broadcastmatchcreated(match) {
    broadcastToAll(wss, { type: "match_created", data: match });
  }

  function broadcastcommentary(matchId, comment) {
    broadcasttomatch(matchId, { type: "comment", data: comment });
  }

  return { broadcastmatchcreated, broadcastcommentary };
}
