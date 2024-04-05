// userController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createUser = async (req, res, next) => {
    const { username, password } = req.body;

    if(!password || !username) { 
        res.status(400).send("Missing fields"); 
        return;
    }

    let existingUser = await User.findOne({username: username});

    if(existingUser) {
      res.status(400).send("User already exists");
      return;
    }

    const user = new User({ username, password });
  
    try {
      await user.save();
      console.log("User created successfully!")

      let token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

      res.status(201).json({ message: "User created successfully!", token: token, id: user.id, username: user.username });
    } catch (error) {
      console.log("User not created");
      res.status(400).send(error);
    }
};