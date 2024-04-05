const Room = require('../models/room');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');
const Game = require('../models/blackjack');


module.exports = function(socket, io) { 
    socket.on('leaveRoom', async({roomCode, username}) => { 
        let room = await Room.findOne({ code: roomCode });
        if(room) { 
            const player = room.players.find(player => player.username === username);
            if (player) {
                room.players = room.players.filter(p => p.username !== username);

                if (room.admin === player.id && room.players.length > 0) {
                    console.log(`setting admin to ${room.players[0].id}`)
                    room.admin = room.players[0].id;
                }
                await room.save();
            }

            let game = await Game.findOne({ roomCode: roomCode });

            if(game) { 
                game.removePlayer(player.id);
                await game.save();

                if(game.players.length === 1) { 
                    const winner = game.endGame();
                    io.to(roomCode).emit('gameOver', { winner });
                }
            }

            socket.leave(roomCode);

            console.log(`User ${username} with IP ${socket.handshake.address} left room ${roomCode}`)
    
            io.to(roomCode).emit('userListUpdate', { admin: room.admin, players: room.players });
        }
    }) 
    
    socket.on('joinRoom', async ({ roomCode, token, username }) => {
        let playerId;
        if(!token) {
            console.log("No token provided");
            return;
        }
        
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            playerId = decoded.id.toString();
        
            if(!playerId) {
                console.log("No player ID provided");
                return;
            }
        
            
        } catch (err) {
            console.log("Invalid token");
            return;
        }

        let room = await Room.findOne({ code: roomCode });
       
        if (!room) {
            socket.emit('roomNotFound');
            return;
        }

        if (room.status === 'in progress') {
            console.log(`User ${username} with IP ${socket.handshake.address} tried to join room ${roomCode} but the game is already in progress`);
            socket.emit('gameInProgress');
            return;
        }
        socket.join(roomCode);

        const player = { id: playerId, username: username };

        if (!room.admin) {
            console.log(`setting admin to ${playerId}`)
            room.admin = playerId;
        }

        if (!room.players.some(p => p.username === username)) {
            room.players.push(player);
        }

        await room.save();
        console.log(`User ${username} with IP ${socket.handshake.address} joined room ${roomCode}`);

        io.to(roomCode).emit('userListUpdate', { admin: room.admin, players: room.players });
    });
    
    
    socket.on('sendMessage', ({ message, username, roomCode }) => {
        console.log(`User ${username} with IP ${socket.handshake.address} sent message ${message} to room ${roomCode}`)
        io.to(roomCode).emit('receiveMessage', { username, message });
    });
    
    socket.on('disconnect', async () => {
        console.log('a user disconnected with id: ' + socket.id);
    
        const rooms = Array.from(socket.rooms);
        rooms.forEach(async roomCode => {
            socket.leave(roomCode);
            console.log(`User with ID ${socket.id} left room ${roomCode}`);
    
            const room = await Room.findOne({ code: roomCode });
            if (room) {
                const player = room.players.find(player => player.id === socket.id);
                if (player) {
                    room.players = room.players.filter(p => p.id !== socket.id);
    
                    if (room.admin === player.id && room.players.length > 0) {
                        room.admin = room.players[0].id;
                    }
                    await room.save();
                }
    
                io.to(roomCode).emit('userListUpdate', { admin: room.admin, players: room.players });
            }
        });
    });

    socket.on('createRoom', async({token, username}) => { 
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        let id = decoded.id.toString();
        const roomData = {
            admin: id,
            players: [
                {
                    id: id,
                    username: username
                }
            ]
        };
    
        try {
            const room = new Room(roomData);
            await room.save(); 

            console.log(`User ${username} with IP ${socket.handshake.address} created room ${room.code}`);
            socket.emit('roomCreated', { roomCode: room.code });
        } catch (error) {
            console.log("Room not created");
            console.error(error);
        }
    });
}