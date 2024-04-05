const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    suit: String,
    value: String
  }, { _id: false });

const playerSchema = new mongoose.Schema({
    id: String,
    username: String,
}, { _id: false });

const gameSchema = new mongoose.Schema({
    players: [playerSchema],
    deck: [cardSchema],
    currentTurn: String,
    currentPlayer: String,
    roomCode: String,
    kingsDrawn: { type: Number, default: 0 },
    gameOver: { type: Boolean, default: false },
});

const rules = [
  {"value": "2", "rule": "You", "description": "You pick someone and any mates that they have gained along the way must drink"},
  {"value": "3", "rule": "Me", "description": "You and your mates drink"},
  {"value": "4", "rule": "Floor", "description": "Last person to touch the floor drinks"},
  {"value": "5", "rule": "Guys", "description": "All guys drink"},
  {"value": "6", "rule": "Chicks", "description": "All girls drink"},
  {"value": "7", "rule": "Heaven", "description": "Last person to raise their hand drinks"},
  {"value": "8", "rule": "Mate", "description": "Pick a mate who must drink with you for the rest of the game"},
  {"value": "9", "rule": "Rhyme", "description": "You say a word and the person to your right must say a word that rhymes. This continues until someone can't think of a word"},
  {"value": "10", "rule": "Categories", "description": "You say a category and the person to your right must say something that fits in that category. This continues until someone can't think of something"},
  {"value": "J", "rule": "Make a Rule", "description": "You make a rule that everyone must follow. If someone breaks the rule they must drink"},
  {"value": "Q", "rule": "Questions", "description": "You ask someone a question and they must respond with a question. If they do not, they must drink."},
  {"value": "K", "rule": "King's Cup", "description": "Pour some of your drink into the King's Cup. The person who draws the last King must drink the King's Cup"},
  {"value": "A", "rule": "Waterfall", "description": "Everyone starts drinking. You can't stop drinking until the person to your right stops drinking."}
]

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

  
  
    const game = new this({ 
      players: players, 
      deck: deck, 
      currentTurn: players[0].id, 
      roomCode: roomCode,
      currentPlayer: players[0].id 
    });
    
    await game.save();
    return game;
};

gameSchema.methods.drawCard = async function(playerId) {
    const player = this.players.find(player => player.id === playerId);
    const card = this.deck.pop();
    
    const rule = rules.find(rule => rule.value === card.value);
    
    rule.id = playerId;

    if (card.value === 'K') {
        this.kingsDrawn += 1;
    }

    if (this.kingsDrawn === 4) {
        this.gameOver = true;
    }

    await this.save();
    return rule;
};

module.exports = mongoose.model('RingOfFire', gameSchema);