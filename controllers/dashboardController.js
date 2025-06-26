const Truck = require('../models/Truck');
const Mission = require('../models/Mission');
const Expense = require('../models/Expense');
const Chauffeur = require('../models/Chauffeur');
const mongoose = require('mongoose');

exports.getDashboard = async (req, res) => {
  try {
    // Ensure user is authenticated and userId is present
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié ou ID utilisateur manquant.' });
    }
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [
      camionsDisponible,
      camionsEnMission,
      chauffeursDisponible,
      chauffeursEnMission,
      depensesAujourdhui,
      missionsAujourdhui
    ] = await Promise.all([
      Truck.countDocuments({ owner: userId, etat: 'disponible' }),
      Truck.countDocuments({ owner: userId, etat: 'en_mission' }),
      Chauffeur.countDocuments({ owner: userId, etat: 'disponible' }),
      Chauffeur.countDocuments({ owner: userId, etat: 'indisponible' }),
      Expense.aggregate([
        { $match: { user: userObjectId, date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Mission.find({ user: userId, departDate: { $gte: today, $lt: tomorrow } })
    ]);

    const revenuAujourdhui = missionsAujourdhui.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const depensesAuj = depensesAujourdhui[0]?.total || 0;
    const beneficeAujourdhui = revenuAujourdhui - depensesAuj;

    res.json({
      camionsDisponible,
      camionsEnMission,
      chauffeursDisponible,
      chauffeursEnMission,
      depensesAujourdhui: depensesAuj,
      revenuAujourdhui,
      beneficeAujourdhui
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
