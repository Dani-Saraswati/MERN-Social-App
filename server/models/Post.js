const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: String,
  username: String,
  content: String,
  likes: { type: [String], default: [] },
  comments: [
    {
      userId: String,
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
