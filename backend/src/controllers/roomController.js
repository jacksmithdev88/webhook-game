const Rooms = require('../models/room');

exports.createRoom = async (req, res) => {
    console.log("Creating a room...");
    const room = new Rooms(req.body);
    console.log(room);
    try {
      await room.save();
      console.log("Room created successfully!")
      res.status(201).send({roomCode: room.code});
      
    } catch (error) {
      console.log("Room not created");
      res.status(400).send(error);
    }
};