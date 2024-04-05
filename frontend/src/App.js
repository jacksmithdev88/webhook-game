// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import RegisterPage from './pages/RegisterPage.js';
import LoginPage from './pages/LoginPage.js';
import LobbyPage from './pages/LobbyPage.js';
import { UserContext } from './context/UserContext.js';
import PrivateRoute from './components/privateRoute.js';
import PublicRoute from './components/publicRoute.js';
import BlackjackPage from './pages/BlackjackPage.js';
import RingOfFirePage from './pages/RingOfFirePage.js';
import { SocketContext } from './context/SocketContext.js';
import { RoomContext } from './context/RoomContext.js';
import { io } from 'socket.io-client';
import { GameDataContext } from './context/GameDataContext.js';
import RoomLobbyPage from './pages/RoomLobby.js';

function App() {
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [user, setUser] = useState(storedUser);
  const [gameData, setGameData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <RoomContext.Provider value={{ roomCode, setRoomCode }}>
      <GameDataContext.Provider value={{ gameData, setGameData }}>
        <SocketContext.Provider value={ socket }>
          <UserContext.Provider value={{ user, setUser }}>
            <Router> 
              <div className="App">
                <Routes>
                  <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                  <Route path="/home" element={<PrivateRoute><LobbyPage /></PrivateRoute>} />
                  <Route path="/game/start/blackjack" element={<PrivateRoute><BlackjackPage></BlackjackPage></PrivateRoute>} />
                  <Route path="/game/start/ring-of-fire" element={<PrivateRoute><RingOfFirePage></RingOfFirePage></PrivateRoute>} />
                  <Route path="/game-select" element={<PrivateRoute><RoomLobbyPage /></PrivateRoute>} />
                </Routes>
              </div>
            </Router>
          </UserContext.Provider>
        </SocketContext.Provider>
      </GameDataContext.Provider>
    </RoomContext.Provider>
  );
}

export default App;