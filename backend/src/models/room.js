const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
  id: String,
  code: String,
  players: [
    {
      id: String,
      username: String,
    },
  ],
  status: String,
  admin: String,
});

RoomSchema.pre('save', async function(next) {
  if (this.isNew) {
    let code;
    let roomWithCodeExists = true;

    while (roomWithCodeExists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      const room = await Room.findOne({ code, status: { $ne: 'complete' } });

      if (!room) {
        roomWithCodeExists = false;
      }
    }

    this.code = code;
    this.status = 'waiting';
  }

  next();
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;