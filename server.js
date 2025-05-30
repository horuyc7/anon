const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// In-memory message storage
let messages = [];

function cleanupOldMessages() {
  const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
  messages = messages.filter(msg => msg.timestamp > threeHoursAgo);
}

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('A user connected');

  cleanupOldMessages();

  // Send only recent messages
  const recentMessages = messages.map(m => m.text);
  recentMessages.forEach(msg => {
    socket.emit('chat message', msg);
  });

  socket.on('chat message', msg => {
    const entry = {
      text: msg,
      timestamp: Date.now()
    };
    messages.push(entry);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
