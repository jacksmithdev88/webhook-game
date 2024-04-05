const express = require('express'); 
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 
const mongoose = require('mongoose');
const app = express(); 
const User = require('./models/user');
const Room = require('./models/room');
const Game = require('./models/blackjack');
const userController = require('./controllers/userController');
const roomController = require('./controllers/roomController');
const userSocketEvents = require('./sockets/userSockets');
const blackjackSocketEvents = require('./sockets/blackjackSockets');
const ringOfFireSockets = require('./sockets/ringOfFireSockets');
const mainRoutes = require('./routes/main');

console.log("Starting app.js...");
mongoose.connect('mongodb://localhost:27017/drinkApp')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err)); 

app.use(cors());
app.use(express.json());
app.use(mainRoutes);
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  }); 
  
const PORT = 3000; 


server.listen(PORT, (error) =>{ 
    if(!error) 
        console.log("Server is Successfully Running, and App is listening on port "+ PORT) 
    else 
        console.log("Error occurred, server can't start", error); 
    } 
); 

const roomUsers = new Map(); 

io.on('connection', (socket) => {
  console.log('Client connected');
  userSocketEvents(socket, io);
  blackjackSocketEvents(socket, io);
  ringOfFireSockets(socket, io);
});

