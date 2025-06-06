const Clue = require('../models/Clue');
const Team = require('../models/Team');
const Media = require('../models/Media');
const QRCode = require('qrcode');

exports.getClue = async (req, res) => {
  try {
    const clue = await Clue.findById(req.params.clueId);
    if (!clue) return res.status(404).json({ message: 'Clue not found' });
    res.json(clue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching clue' });
  }
};

exports.getAllClues = async (req, res) => {
  try {
    const clues = await Clue.find().sort({ createdAt: 1 });
    res.json(clues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all clues' });
  }
};

exports.createClue = async (req, res) => {
  const { title, text, options, correctAnswer, infoPage } = req.body;
  let imageUrl = '';
  if (req.file) {
    imageUrl = '/uploads/' + req.file.filename;
    await Media.create({
      url: imageUrl,
      uploadedBy: req.user._id,
      type: 'question',
      tag: 'clue_image'
    });
  }
  try {
    let qrCodeData = '';
    if (req.body.generateQRCode === 'true') {
      const qrString = `clue-${Date.now()}-${Math.random()}`;
      qrCodeData = await QRCode.toDataURL(qrString);
    }
    const newClue = new Clue({
      title,
      text,
      imageUrl,
      options: options ? options.split(',') : [],
      correctAnswer,
      qrCodeData,
      infoPage: infoPage === 'true'
    });
    await newClue.save();
    res.status(201).json(newClue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating clue' });
  }
};

exports.submitAnswer = async (req, res) => {
  const { answer } = req.body;
  try {
    const clue = await Clue.findById(req.params.clueId);
    if (!clue) return res.status(404).json({ message: 'Clue not found' });
    const team = await Team.findById(req.user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (clue.infoPage) {
      team.completedClues.push(Number(req.params.clueId));
      team.currentClue += 1;
      await team.save();
      return res.json({ correct: true, nextClue: team.currentClue });
    }

    if (answer.trim().toLowerCase() === clue.correctAnswer.trim().toLowerCase()) {
      team.completedClues.push(Number(req.params.clueId));
      team.currentClue += 1;
      await team.save();
      return res.json({ correct: true, nextClue: team.currentClue });
    } else {
      return res.json({ correct: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting answer' });
  }
};
