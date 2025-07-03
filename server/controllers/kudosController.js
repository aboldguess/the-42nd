const KudosCategory = require('../models/KudosCategory');
const KudosVote = require('../models/KudosVote');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');
const mongoose = require('mongoose');

// Helper to recalc and store the leader for a category
async function updateLeader(categoryId) {
  const votes = await KudosVote.aggregate([
    { $match: { category: new mongoose.Types.ObjectId(categoryId) } },
    { $group: { _id: '$recipient', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  if (!votes.length) {
    await KudosCategory.findByIdAndUpdate(categoryId, {
      leadingUser: null,
      leadingCount: 0
    });
    return null;
  }
  const top = votes[0];
  const cat = await KudosCategory.findById(categoryId);
  const prevLeader = cat.leadingUser?.toString();
  await KudosCategory.findByIdAndUpdate(categoryId, {
    leadingUser: top._id,
    leadingCount: top.count
  });
  if (prevLeader !== String(top._id)) {
    // Notify the new leader
    const user = await User.findById(top._id);
    if (user) {
      await createNotification({
        user: user._id,
        message: `You are now leading "${cat.title}" kudos!`
      });
    }
  }
  return top;
}

// Public: list categories with current leader info
exports.listCategories = async (req, res) => {
  try {
    const cats = await KudosCategory.find()
      .sort({ createdAt: 1 })
      .populate('leadingUser', 'firstName photoUrl');
    // Also include the current user's votes
    let votes = [];
    if (req.user) {
      votes = await KudosVote.find({ voter: req.user._id });
    }
    const voteMap = new Map(votes.map(v => [v.category.toString(), v.recipient.toString()]));
    const data = cats.map(c => ({
      _id: c._id,
      title: c.title,
      leader: c.leadingUser ? {
        _id: c.leadingUser._id,
        firstName: c.leadingUser.firstName,
        photoUrl: c.leadingUser.photoUrl
      } : null,
      myVote: voteMap.get(c._id.toString()) || null
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching kudos categories' });
  }
};

// Cast or update a vote for a kudos category
exports.castVote = async (req, res) => {
  const { id } = req.params;
  const { recipient } = req.body;
  if (!recipient) {
    return res.status(400).json({ message: 'Recipient is required' });
  }
  try {
    const category = await KudosCategory.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const vote = await KudosVote.findOneAndUpdate(
      { category: id, voter: req.user._id },
      { recipient },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Notify the recipient of the vote
    const actor = await User.findById(req.user._id);
    const recUser = await User.findById(recipient);
    if (recUser) {
      await createNotification({
        user: recUser._id,
        actor,
        message: `${actor.firstName} voted for you as "${category.title}"`
      });
    }
    // Recalculate leader
    await updateLeader(id);
    res.json(vote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error casting vote' });
  }
};

// Admin: CRUD operations
exports.createCategory = async (req, res) => {
  try {
    const cat = await KudosCategory.create({ title: req.body.title });
    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await KudosCategory.findByIdAndUpdate(req.params.id, { title: req.body.title }, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await KudosVote.deleteMany({ category: req.params.id });
    const cat = await KudosCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const cats = await KudosCategory.find().sort({ createdAt: 1 });
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

