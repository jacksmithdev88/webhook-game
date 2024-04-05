import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { GameDataContext } from '../context/GameDataContext';

const LobbyPage = () => { 
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [players, setPlayers] = useState([]);
    const [roomCode, setRoomCode] = useState(null);
    const [admin, setAdmin] = useState(null);
    const { setGameData } = useContext(GameDataContext);

    useEffect(() => { 
        socket.on('userListUpdate', (data) => {
            console.log(data);
            setPlayers(data.players);
            setAdmin(data.admin);
        });

        socket.on('gameStartBlackjack', (data) => { 
            setGameData(data);
            navigate('/game/start/blackjack');
        });

        socket.on('gameStartRingOfFire', (data) => {
            setGameData(data);
            navigate('/game/start/ring-of-fire');
        });

        return () => {
            socket.off('userListUpdate');
        };
    }, [socket, navigate, setGameData]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    const joinRoom = () => {
        let roomName = document.getElementById("roomName").value;
        socket.emit('joinRoom', {roomCode: roomName, username: user.username, token: user.token});
        setRoomCode(roomName);
    };

    const leaveRoom = () => { 
        socket.emit('leaveRoom', {roomCode: roomCode, username: user.username});
        setRoomCode(null);
        setPlayers([]);
        setAdmin(null);
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
        <div> 
            <h1>Lobby</h1> 
            <p> 
                Welcome to the lobby. 
            </p> 
            <div className='flex flex-col flex-1'>
                <div>If you are going to be the host then please Create a Room.</div>
                <button className='w-1/4 m-auto'>Create Room</button>
            </div>

            <div className='flex flex-col flex-1'>
                <div>If you are going to be the guest then please Join a Room.</div>
                <input type="text" id="roomName" className='w-1/4 m-auto my-4 border rounded-md p-2 border-gray-600' name="roomName" />
                <button className='w-1/4 m-auto' onClick={joinRoom}>Join Room</button>

                <div className='flex flex-col flex-1'>
                    <h2>Players in Room { roomCode }</h2>
                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>
                                {player.username} {player.id === admin && "(Admin)"}
                            </li>
                        ))}
                    </ul>

                    <div> {admin === user.id ? <div
                    ><div>Please click start when everyone is in.</div>
                     
                     <select id="game-select" name="game-select">
                        <option value="blackjack">Blackjack</option>
                        <option value="ring-of-fire">Ring of Fire</option>
                     </select>

                     <button onClick={startGame}>Start Game</button>
                     </div> : null} </div>
                </div>
            </div>          
            <div>
            {roomCode ? (
                <div>
                    {roomCode} <button onClick={leaveRoom}>Leave Room</button>
                </div>
            ) : (
                <div>No room code provided</div>
            )}
            </div>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default LobbyPage;