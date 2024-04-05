import React, { useEffect, useState, useContext } from 'react';
import { GameDataContext } from '../context/GameDataContext';
import { SocketContext } from '../context/SocketContext';
import { UserContext } from '../context/UserContext';
import Cards from '../components/cards';
import { useNavigate } from 'react-router-dom';

const BlackjackPage = () => {
    const { gameData, setGameData } = useContext(GameDataContext);
    const { user } = useContext(UserContext);
    const [ winner, setWinner ] = useState(false);
    const navigate  = useNavigate();
    const socket = useContext(SocketContext);
    const [player, setPlayer] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentPlayerName, setCurrentPlayerName] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const playerHit = () => {
        socket.emit('user-blackjack-hit', {token: user.token, roomCode: gameData.game.roomCode , username: user.username});
    }

    const playerStand = () => {
        socket.emit('user-blackjack-stand', {token: user.token, roomCode: gameData.game.roomCode , username: user.username});
    }

    const startNewGame = () => {
        socket.emit('startNewGameBlackjack', {token: user.token, roomCode: gameData.game.roomCode , username: user.username});
        setGameOver(false);
    }

    const exitGame = () => { 
        // disconnect from the socket room
        socket.emit('leaveRoom', {token: user.token, roomCode: gameData.game.roomCode , username: user.username});
        navigate('/');
    }

    useEffect(() => {
        const handleConnect = () => {
            console.log("Connected to server");
            console.log("Is socket connected?", socket.connected);
        };
    
        const handleBlackjackHit = (data) => {
            setGameData(data);
        };
        
        const handleGameOver = (data) => {
            if (data.winner.id === user.id) {
                setWinner(true);
            }
            else {
                setWinner(false);
            }
            setGameOver(true);
        };
        
        const handleBlackjackStand = (data) => {
            setGameData(data);
        };
    
        const restartGame = (data) => { 
            console.log("Game starting");
            console.log("Data:", data);

            setGameData(data);
            setGameOver(false);

            const foundPlayer = data.game.playerScores.find(player => player.id === user.id);
            console.log(foundPlayer);
            setWinner(false);
            setPlayer(prevPlayer => foundPlayer || prevPlayer);
        };

        socket.on('connect', handleConnect);
        socket.on('blackjack-hit', handleBlackjackHit);
        socket.on('gameStartBlackjack', restartGame);
        socket.on('gameOver', handleGameOver);
        socket.on('blackjack-stand', handleBlackjackStand);
    
        return () => {
            socket.off('connect', handleConnect);
            socket.off('blackjack-hit', handleBlackjackHit);
            socket.off('gameOver', handleGameOver);
            socket.off('blackjack-stand', handleBlackjackStand);
            socket.off('gameStartBlackjack', restartGame);
        };
    }, [socket, setGameData, user.id]);
    
    useEffect(() => {
        if (gameData && gameData.game) {
            const foundPlayer = gameData.game.playerScores.find(player => player.id === user.id);
            setPlayer(prevPlayer => foundPlayer || prevPlayer);
    
            const currentPlayerGo = gameData.game.currentPlayer;
            const currentPlayerName = gameData.game.players.find(player => player.id === currentPlayerGo);
            setCurrentPlayerName(prevName => currentPlayerName || prevName);
            setCurrentPlayer(currentPlayerGo);
        }
    }, [gameData, user.id, gameOver]);

    return ( 
        <div>
            <div id='cards' className="flex flex-1 flex-row m-auto w-full justify-center my-8">
            {player && <Cards key={gameOver} cards={player.cards} />}
            </div>
            { gameOver && winner ? <div>Game Over! You won!</div> : null }

            { gameOver && !winner ? <div>Game Over! You lost!</div> : null }
            <div id="totalScore">Your Current Score is: <span className="font-bold">{ player ? player.score : 0 }</span></div>
            { 
            gameOver 
            ? <button onClick={startNewGame}>Start New Game</button>
            : currentPlayer === user.id 
                ? <div>
                    <div>It is currently your turn.</div> 
                    <div id="buttons" className='flex flex-row flex-1 justify-center'>
                        <button onClick={playerHit}>Hit</button>
                        <button onClick={playerStand}>Stand</button>
                    </div>
                </div> 
                : <div>It is currently {currentPlayerName ? currentPlayerName.username : 'unknown'}'s turn.</div>
            }

            <div className="mt-6 text-center" onClick={exitGame}><button>Home</button></div>

           
        </div>
    )
}

export default BlackjackPage;