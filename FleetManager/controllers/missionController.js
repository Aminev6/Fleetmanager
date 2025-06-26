const Mission = require("../models/Mission");
const Truck = require("../models/Truck");
const Chauffeur = require('../models/Chauffeur');

exports.startMission = async (req, res) => {
  try {
    const { truck, chauffeur, departDate, expectedDate } = req.body;
    // Check if chauffeur or truck is available
    const foundChauffeur = await Chauffeur.findOne({ _id: chauffeur, owner: req.user.userId });
    const foundTruck = await Truck.findOne({ _id: truck, owner: req.user.userId });
    if (!foundChauffeur || foundChauffeur.etat !== 'disponible') {
      return res.status(400).json({ error: "Ce chauffeur n'est pas disponible." });
    }
    if (!foundTruck || foundTruck.etat !== 'disponible') {
      return res.status(400).json({ error: "Ce camion n'est pas disponible." });
    }
    // Set etat to unavailable
    foundChauffeur.etat = 'indisponible';
    await foundChauffeur.save();
    console.log('Chauffeur etat after mission:', foundChauffeur.etat);
    foundTruck.etat = 'en_mission';
    await foundTruck.save();
    console.log('Truck etat after mission:', foundTruck.etat);
    const mission = new Mission({
      truck,
      chauffeur,
      user: req.user.userId,
      departDate,
      expectedDate,
      status: 'en_cours'
    });
    await mission.save();
    res.status(201).json(mission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.endMission = async (req, res) => {
  try {
    const { revenue, kilometrageRetour, returnDate } = req.body;
    const mission = await Mission.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        revenue,
        kilometrageRetour,
        returnDate,
        status: 'terminee'
      },
      { new: true }
    ).populate(["truck", "chauffeur"]);
    if (!mission) return res.status(404).json({ message: "Mission introuvable" });
    // Mettre à jour le kilométrage du camion
    if (mission.truck && kilometrageRetour) {
      await Truck.findByIdAndUpdate(mission.truck._id, {
        kilometrageActuel: kilometrageRetour,
        etat: 'disponible'
      });
      console.log('Truck etat after end mission: disponible');
    }
    // Rendre le chauffeur disponible
    if (mission.chauffeur) {
      await Chauffeur.findByIdAndUpdate(mission.chauffeur._id, { etat: 'disponible' });
      console.log('Chauffeur etat after end mission: disponible');
    }
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.userId;

    const [missions, total] = await Promise.all([
      Mission.find({ user: userId })
        .populate("truck")
        .sort({ departDate: -1 })
        .skip(skip)
        .limit(limit),
      Mission.countDocuments({ user: userId })
    ]);

    res.json({
      missions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
