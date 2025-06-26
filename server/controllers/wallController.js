const Comment = require('../models/Comment');
const Media = require('../models/Media');

// Helper to map URL param to model name
function modelFromType(type) {
  return type === 'user' ? 'User' : type === 'team' ? 'Team' : null;
}

// List comments on a player or team wall
exports.getWall = async (req, res) => {
  const model = modelFromType(req.params.type);
  if (!model) return res.status(400).json({ message: 'Invalid wall type' });

  try {
    const comments = await Comment.find({
      target: req.params.id,
      targetModel: model
    })
      .populate('author', 'name photoUrl')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Post a new comment with optional photo
exports.postComment = async (req, res) => {
  const model = modelFromType(req.params.type);
  if (!model) return res.status(400).json({ message: 'Invalid wall type' });

  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
      // Record uploaded photos in the Media collection for gallery use
      await Media.create({
        url: imageUrl,
        uploadedBy: req.user._id,
        uploadedByModel: 'User',
        team: model === 'Team' ? req.params.id : req.user.team,
        type: 'other',
        tag: 'wall'
      });
    }

    const comment = await Comment.create({
      content: req.body.content || '',
      imageUrl,
      author: req.user._id,
      target: req.params.id,
      targetModel: model
    });

    const populated = await comment.populate('author', 'name photoUrl');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error posting comment' });
  }
};
