let socket = null;

export const connectSocket = (onMessage) => {
  socket = new WebSocket("ws://127.0.0.1:8000/ws/analysis/");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onopen = () => console.log("WebSocket connected");
  socket.onclose = () => console.log("WebSocket disconnected");
};

export const disconnectSocket = () => {
  if (socket) socket.close();
};
