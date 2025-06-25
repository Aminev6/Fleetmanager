const Chauffeur = require('../models/Chauffeur');

exports.addChauffeur = async (req, res) => {
  try {
    const { nom, cin, adresse, telephone } = req.body;
    // Check for duplicate CIN for this user
    const existing = await Chauffeur.findOne({ cin, owner: req.user.userId });
    if (existing) {
      return res.status(400).json({ error: "Ce chauffeur existe déjà dans votre liste." });
    }
    const chauffeur = new Chauffeur({
      nom,
      cin,
      adresse,
      telephone,
      etat: 'disponible',
      owner: req.user.userId
    });
    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChauffeurs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userId = req.user.userId;
    const query = { owner: userId };
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { cin: { $regex: search, $options: 'i' } }
      ];
    }
    const [chauffeurs, total] = await Promise.all([
      Chauffeur.find(query)
        .sort({ nom: 1 })
        .skip(skip)
        .limit(limit),
      Chauffeur.countDocuments(query)
    ]);
    res.json({
      chauffeurs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!chauffeur) return res.status(404).json({ message: 'Chauffeur non trouvé' });
    res.json({ message: 'Chauffeur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 