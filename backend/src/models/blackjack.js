// models/game.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  suit: String,
  value: String
}, { _id: false });

const playerScoreSchema = new mongoose.Schema({
  id: String,
  username: String,
  cards: [cardSchema],
  score: Number,
  bust: { type: Boolean, default: false },
  stand: { type: Boolean, default: false }
}, { _id: false });

const playerSchema = new mongoose.Schema({
  id: String,
  username: String,
}, { _id: false });

const gameSchema = new mongoose.Schema({
  players: [playerSchema],
  playerScores: [playerScoreSchema],
  deck: [cardSchema],
  currentTurn: String,
  currentPlayer: String,
  roomCode: String,
});

function calculateScore(cards) {
  let score = 0;
  let aceCount = 0;

  cards.forEach(card => {
    if (card.value === 'A') {
      aceCount++;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  });

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

gameSchema.methods.stand = async function(id, roomCode) {
  if (this.roomCode !== roomCode) {
    throw new Error('Wrong room');
  }

  // Find the player
  let player = this.playerScores.find(player => player.id === id);
  console.log(player);
  if(player) {
    // If the player has already busted or stood, they can't go again
    if (player.bust || player.stand) {
      this.changeCurrentPlayer();
      await this.save();
      return; 
    }

    player.stand = true;
    console.log(`${id} has stood.`)
    this.markModified('playerScores');  // Add this line
    this.changeCurrentPlayer();
    await this.save();
  } else {
    this.changeCurrentPlayer();
    await this.save();
  }
};

gameSchema.statics.startNewGame = async function(players, roomCode) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const deck = [];

  suits.forEach(suit => {
      values.forEach(value => {
          deck.push({ suit, value });
      });
  });

  for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const playerScores = players.map(player => {
    const cards = [deck.pop(), deck.pop()]; // Assign two random cards to the player
    const score = calculateScore(cards); // Calculate the score based on the cards
    return { id: player.id, username: player.username, cards, score, bust: false, stand: false }; // Add bust and stand fields
  });


  const game = new this({ 
    players: players, 
    playerScores,
    deck: deck, 
    currentTurn: players[0].id, 
    roomCode: roomCode,
    currentPlayer: players[0].id 
  });
  await game.save();
  return game;
};

gameSchema.methods.removePlayer = function(id) {
  console.log(`Removing player ${id} from the game.`)
  // Find the player
  const playerIndex = this.players.findIndex(player => player.id === id);
  const playerScoreIndex = this.playerScores.findIndex(player => player.id === id);

  if (playerIndex !== -1) {
    // Remove the player and their score
    this.players.splice(playerIndex, 1);
    this.playerScores.splice(playerScoreIndex, 1);

    // If the player who left was the current player, change the current player
    if (this.currentPlayer === id) {
      this.changeCurrentPlayer();
    }

    // If there's only one player left, end the game
    if (this.players.length === 1) {
      this.endGame();
    }
  }
};

gameSchema.methods.hit = async function(id) {
  // Find the player
  let player = this.playerScores.find(player => player.id === id);
  if(player) {
    // If the player has already busted, they can't go again
    if (player.bust) {
      this.changeCurrentPlayer();
      this.save();
 
    }
    let deck = this.deck;
    player.cards.push(deck.pop());

    let newScore = calculateScore(player.cards);

    // Only update the score if the player hasn't busted
    if (newScore <= 21) {
      player.score = newScore;
      console.log(newScore);
      player.cards = player.cards;
      this.save();
    } else {
      player.bust = true;
      this.changeCurrentPlayer();
      this.save();
    }
    
  } else {
    this.changeCurrentPlayer();
    this.save();
  }
};

gameSchema.methods.changeCurrentPlayer = function() {
  console.log("Changing current player.")
  const currentPlayerIndex = this.players.findIndex(player => player.id === this.currentPlayer);
  const nextPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
  
  if (this.players[nextPlayerIndex]) {
    this.currentPlayer = this.players[nextPlayerIndex].id;
    console.log(`It is now ${this.players[nextPlayerIndex].username}'s turn.`);
  } else {
    console.log('No more players left.');
  }
};

gameSchema.methods.endGame = function() {
  const winner = this.playerScores.reduce((highest, player) => {
    return (highest.score > player.score && !highest.bust) ? highest : player;
  });
  console.log(winner);

  // Emit a message with the winner
  console.log(`Game over. The winner is ${winner.username} with a score of ${winner.score}.`);
  return winner;  
};

gameSchema.methods.resetGameState = function() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Create a new deck of cards
  const deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Reset the player scores
  const playerScores = this.players.map(player => {
    const cards = [deck.pop(), deck.pop()]; 
    const score = calculateScore(cards);
    return { id: player.id, username: player.username, cards, score, bust: false, stand: false };
});

  // Reset the game state
  this.playerScores = playerScores;
  this.deck = deck;
  this.currentPlayer = this.players[0].id;
};

module.exports = mongoose.model('Blackjack', gameSchema);