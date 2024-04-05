import { SocketContext } from '../context/SocketContext';
import { GameDataContext } from '../context/GameDataContext';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';

const RingOfFirePage = () => {
    const { gameData, setGameData } = useContext(GameDataContext);
    const socket = useContext(SocketContext);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentPlayerName, setCurrentPlayerName] = useState(null);
    const [gameOver] = useState(false);
    const { user } = useContext(UserContext);

    const drawCardRingOfFire = () => { 
        socket.emit('drawCardRingOfFire', {token: user.token, roomCode: gameData.game.roomCode , username: user.username});
    };

    useEffect(() => {
        if (gameData && gameData.game && gameData.game.players) {
            const currentPlayerGo = gameData.game.currentPlayer;
            const currentPlayerName = gameData.game.players.find(player => player.id === currentPlayerGo);
            setCurrentPlayerName(prevName => currentPlayerName || prevName);
            setCurrentPlayer(currentPlayerGo);
        }
    }, [gameData, user.id, gameOver]);

    useEffect(() => {
        const handleCardDrawn = (data) => {
            console.log(data);
            setGameData(prevGameData => ({
                ...prevGameData,
                game: {
                    ...prevGameData.game,
                    lastDrawnCard: data.card,
                    lastPlayerWhoDrew: user.username,
                },
            }));
        };
    


        socket.on('cardDrawnRingOfFire', handleCardDrawn);
    
        return () => {
            socket.off('cardDrawnRingOfFire', handleCardDrawn);
        };
    }, [socket, setGameData, user.id]);

    return ( 
        <div>
            <div>
                <div className="flex flex-col flex-1">
                    <div>Last card drawn: {gameData.game.lastDrawnCard ? gameData.game.lastDrawnCard.value : 'None'}</div>
                    <div>Rule: {gameData.game.lastDrawnCard ? gameData.game.lastDrawnCard.rule : 'None'}</div>
                    <div>Drawn by: {gameData.game.lastPlayerWhoDrew ? gameData.game.lastPlayerWhoDrew : 'None'}</div>
                </div>

                { 
                gameOver 
                ? <button >Start New Game</button>
                : currentPlayer === user.id 
                    ? <div>
                        <div>It is currently your turn.</div> 
                        <div id="buttons" className='flex flex-row flex-1 justify-center'>
                            <button onClick={drawCardRingOfFire} >Draw a Card</button>
                           
                        </div>
                    </div> 
                    : <div>It is currently {currentPlayerName ? currentPlayerName.username : 'unknown'}'s turn.</div>
                }

            </div>
        </div>
    )
};

export default RingOfFirePage;