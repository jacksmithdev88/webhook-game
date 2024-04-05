const Room = require('../models/room');
const Game = require('../models/blackjack');
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function(socket, io) { 
    
    socket.on('startNewGameBlackjack', async ({ token, roomCode, username }) => {
        console.log("New game created.");
        let game = await Game.findOne({ roomCode: roomCode });
        if (game) {
            game.resetGameState();
            await game.save();
            socket.join(roomCode);
            io.to(roomCode).emit('gameStartBlackjack', { game: game });
        }
    });

    socket.on('user-blackjack-stand', async ({token, roomCode, username}) => {
        let room = await Room.findOne({ code: roomCode });
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        let id = decoded.id;

        if (!room) {
            socket.emit('roomNotFound');
            return;
        }

        if (room.status !== 'in progress') {
            socket.emit('gameNotInProgress');
            return;
        }

        if (room) {
            let game = await Game.findOne({ roomCode: roomCode });
            if (game) {
                await game.stand(id, roomCode);
                io.to(roomCode).emit('blackjack-stand', { game: game });

                const allPlayersDone = game.playerScores.every(player => player.bust || player.stand);
                if (allPlayersDone) {
                    const winner = game.endGame();
                    io.to(roomCode).emit('gameOver', { winner });
                }
            }
        }
    });

    socket.on('user-blackjack-hit', async ({ token, roomCode, username }) => {
        io.to(roomCode).emit('test', { username });
        let room = await Room.findOne({ code: roomCode });
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        let id = decoded.id;
        console.log(`User ${username} hit in room ${roomCode}`)
        if (!room) {
            socket.emit('roomNotFound');
            return;
        }

        if (room.status !== 'in progress') {
            socket.emit('gameNotInProgress');
            return;
        }

        if (room) {
            let game = await Game.findOne({ roomCode: roomCode });
        
            if(game) { 
                await game.hit(id);

                let player = game.playerScores.find(player => player.username === username);
                if (player && player.bust) {
                    console.log("bust for user: " , username);
                    io.to(roomCode).emit('bust', { username });
                }
                io.to(roomCode).emit('blackjack-hit', { game: game });

                const allPlayersDone = game.playerScores.every(player => player.bust || player.stand);
                if (allPlayersDone) {
                    const winner = game.endGame();
                    io.to(roomCode).emit('gameOver', { winner });
                }
            }
        }
    });

    socket.on('startGameBlackjack', async ({ roomCode, token, username }) => {
        let room = await Room.findOne({ code: roomCode});

        let user = jwt.verify(token, process.env.SECRET_KEY);

        let players = room.players;
        if (room) {
        room.status = 'in progress';
        await room.save();

            if (room.admin !== user.id) {
                io.to(roomCode).emit('notAdmin', { message: 'Only the admin can start the game' });
                return;
            }

            if(!room) {
                res.status(404).json({ error: 'Room not found' });
                return;
            }
            const game = await Game.startNewGame(players, roomCode);
            socket.join(roomCode);

            io.to(roomCode).emit('gameStartBlackjack', { message: 'Game has started!', game: game });
            } else {
                console.log(`No room found with code ${roomCode}`);
            }
    });

    socket.on('userLoaded', async({ token, username, roomCode }) => {
        console.log(`User ${username} with IP ${socket.handshake.address} loaded in room ${roomCode}`)
    });
}