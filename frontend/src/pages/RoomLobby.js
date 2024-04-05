import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { RoomContext } from '../context/RoomContext'; // import the RoomContext
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { GameDataContext } from '../context/GameDataContext';

const RoomLobbyPage = () => { 
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { roomCode } = useContext(RoomContext); // use the RoomContext to get roomCode
    const socket = useContext(SocketContext);
    const { setGameData } = useContext(GameDataContext);

    useEffect(() => {
        socket.on('gameStartBlackjack', (data) => { 
            setGameData(data);
            navigate('/game/start/blackjack');
        });

        socket.on('gameStartRingOfFire', (data) => {
            setGameData(data);
            navigate('/game/start/ring-of-fire');
        });
     });

     const leaveRoom = () => {
        socket.emit('leaveRoom', {roomCode: roomCode, username: user.username, token: user.token});
        navigate('/');
    }

    const startGameBlackjack = () => { 
        socket.emit('startGameBlackjack', {roomCode: roomCode, username: user.username, token: user.token});
    }

    const startGameRingOfFire = () => { 
        socket.emit('startGameRingOfFire', {roomCode: roomCode, username: user.username, token: user.token})
    }

    const startGame = () => { 
        let gameSelect = document.getElementById("game-select").value;
        if(gameSelect === "blackjack") { 
            startGameBlackjack();
        } else if (gameSelect === "ring-of-fire") { 
            startGameRingOfFire();
        }
    }

    return ( 
        <div className="flex flex-col justify-center text-text text-xl items-center h-screen"> 
        
            <h1 className='text-2xl font-bold my-4'>Room Code: {roomCode}</h1>
            <p>Please select a game to start.</p> 
            <select  className='w-1/2 m-auto my-4 border rounded-md p-2 border-gray-600 bg-button-main text-text placeholder-text' id="game-select" name="game-select">
                <option value="blackjack">Blackjack</option>
                <option value="ring-of-fire">Ring of Fire</option>
            </select>
            <button onClick={startGame}>Start Game</button>

            <button onClick={leaveRoom}>Leave Room</button>
        </div>
    )
}

export default RoomLobbyPage;