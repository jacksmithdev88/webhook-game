const Room = require('../models/room');
const Game = require('../models/ringOfFire');
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function(socket, io) { 
        
    socket.on('startGameRingOfFire', async ({ token, roomCode, username }) => {
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        let id = decoded.id;

        let room = await Room.findOne({ code: roomCode});

        if (room.admin !== id) {
            io.to(roomCode).emit('notAdmin', { message: 'Only the admin can start the game' });
            return;
        }

        if(!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        if(room) { 
            let game = await Game.startNewGame(room.players, roomCode);
            console.log(game);
            

            socket.join(roomCode);
            io.to(roomCode).emit('gameStartRingOfFire', { message: 'Game has started!', game: game });
        }

    });

    socket.on('drawCardRingOfFire', async ({ token, roomCode, username }) => {
        console.log("drawing card");
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        let id = decoded.id;

        let room = await Room.findOne({ code: roomCode});

        if(!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        if(room) { 
            let game = await Game.findOne({ roomCode: roomCode });
            if(game) { 
                let card = await game.drawCard(id);
                
                socket.emit("cardDrawnRingOfFire", {card: card});
            }
        }

    });
}