
import http = require('http');
import express = require('express');
import { Server } from 'socket.io';


let app = express();
let server = http.createServer(app);
let io = new Server(server);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
