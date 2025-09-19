const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, username, content } = req.body;
  try {
    const post = new Post({ userId, username, content });
    await post.save();
    res.json(post);
  } catch {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.status(500).json({ message: 'Failed to get posts' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch {
    res.status(500).json({ message: 'Failed to update post' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

router.post('/:id/like', async (req, res) => {
  const userId = req.body.userId;
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    res.json(post);
  } catch {
    res.status(500).json({ message: 'Failed to like post' });
  }
});

router.post('/:id/comment', async (req, res) => {
  const { userId, username, text } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ userId, username, text });
    await post.save();
    res.json(post);
  } catch {
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
