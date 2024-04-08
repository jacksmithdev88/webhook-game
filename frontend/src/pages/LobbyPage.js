import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { RoomContext } from '../context/RoomContext';

const LobbyPage = () => { 
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const { setRoomCode } = useContext(RoomContext); 

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    const joinRoom = () => {
        let roomName = document.getElementById("roomName").value;
        socket.emit('joinRoom', {roomCode: roomName, username: user.username, token: user.token});
        setRoomCode(roomName);
        navigate('/game-select');
    };

    socket.on('roomCreated', (data) => {
        socket.emit('joinRoom', {roomCode: data.roomCode, username: user.username, token: user.token});
        setRoomCode(data.roomCode);
        navigate('/game-select');
    });

    const createRoom = () => { 
        socket.emit('createRoom', {username: user.username, token: user.token});
        socket.on('roomCreated', (data) => {
            setRoomCode(data.roomCode);
            navigate('/game-select');
        });
    }

    return ( 
        <div className="flex w-full flex-col justify-center text-text text-xl items-center h-screen"> 
            
            <div>
                <div className='flex w-full flex-col my-5 flex-1 border-2 border-gray-300 p-8 rounded-md'>
                    <div className="my-2">If you are going to be the host then please Create a Room.</div>
                    <button onClick={createRoom} className='w-1/2 m-auto text-text bg-button-main'>Create Room</button>
                </div>
            </div>

            <div>
                <div className='flex w-full flex-col my-5 flex-1 border-2 border-gray-300 p-8 rounded-md'>
                    <div className="my-2">If you are going to be the guest then please Join a Room.</div>
                    <input type="text" id="roomName" className='w-full m-auto my-4 border rounded-md p-2 border-gray-600 bg-button-main text-text placeholder-text' name="roomName" />
                    <button className='w-1/2 m-auto bg-button-secondary text-text' onClick={joinRoom}>Join Room</button>
                </div>          
                <button className="bg-button-main text-text" onClick={logout}>Logout</button>
            </div>
        </div>
    )
}

export default LobbyPage;