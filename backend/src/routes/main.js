const express = require('express');
require('dotenv').config();
const router = express.Router();
const userController = require('../controllers/userController');
const roomController = require('../controllers/roomController');
const Room = require('../models/room');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => { 
    res.status(200); 
    res.send("Welcome to root URL of Server"); 
}); 

router.get('/rooms', async (req, res) => {
  const rooms = await Room.find();
  res.status(200).json(rooms);
});

router.post('/register', userController.createUser);

router.post('/login', async (req, res) => {
  try {
    const user = await User.login(req.body.username, req.body.password);

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    
    res.status(200).json({ token: token, id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/room/create', roomController.createRoom);

module.exports = router;