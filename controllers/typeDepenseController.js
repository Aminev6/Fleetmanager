const TypeDepense = require('../models/TypeDepense');

exports.addTypeDepense = async (req, res) => {
  try {
    const { name, category } = req.body;
    const type = new TypeDepense({
      name,
      category,
      owner: req.user.userId
    });
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTypeDepenses = async (req, res) => {
  try {
    const types = await TypeDepense.find({ owner: req.user.userId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTypeDepense = async (req, res) => {
  try {
    const type = await TypeDepense.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!type) return res.status(404).json({ message: 'Type de dépense non trouvé' });
    res.json({ message: 'Type de dépense supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 