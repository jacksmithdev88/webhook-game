const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

UserSchema.pre('save', async function (next) { 
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true
});

UserSchema.statics.login = async function(username, password) {
  const user = await this.findOne({ username });

  if (!user) {
    throw new Error('User not found');
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    throw new Error('Incorrect password');
  }

  let token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

  return {token: token, id: user.id, username: user.username};
};

const User = mongoose.model('User', UserSchema);

module.exports = User;