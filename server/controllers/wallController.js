const WallPost = require('../models/WallPost');
const User = require('../models/User');
const Media = require('../models/Media');

// Retrieve wall posts for a particular user
exports.getWall = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name photoUrl');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await WallPost.find({ recipient: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name photoUrl');
    res.json({ user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching wall' });
  }
};

// Create a new wall post targeting a user
exports.createPost = async (req, res) => {
  try {
    let mediaUrl = '';
    if (req.files && req.files.media && req.files.media[0]) {
      mediaUrl = '/uploads/' + req.files.media[0].filename;
      await Media.create({
        url: mediaUrl,
        uploadedBy: req.user._id,
        team: req.user.team,
        type: 'other',
        tag: 'wall'
      });
    }

    const post = await WallPost.create({
      author: req.user._id,
      recipient: req.params.id,
      message: req.body.message || '',
      mediaUrl
    });
    await post.populate('author', 'name photoUrl');
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error posting to wall' });
  }
};
