const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    streak: {
      type: Number,
      default: 0,
    },

    bestScore: {
      type: Number,
      default: 0,
    },

    gamesPlayed: {
      type: Number,
      default: 0,
    },

    achievements: {
      type: [String],
      default: [],
    },

    lastDailyChallenge: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);