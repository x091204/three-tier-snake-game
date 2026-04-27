const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema(
  {
    score:    { type: Number, required: true },
    userId:   { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Score', ScoreSchema);