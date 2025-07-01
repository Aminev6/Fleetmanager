console.log('TRUCK CONTROLLER LOADED');
const Truck = require("../models/Truck");

// Alert thresholds
const VIDANGE_KM_THRESHOLD = 500; // km
const DATE_THRESHOLD_DAYS = 30; // days

exports.addTruck = async (req, res) => {
  try {
    console.log('addTruck req.body:', req.body);
    // Check for duplicate immatriculation for this user
    const existing = await Truck.findOne({ immatriculation: req.body.immatriculation, owner: req.user.userId });
    if (existing) {
      return res.status(400).json({ error: "Ce camion existe déjà dans votre liste." });
    }
    const newTruck = new Truck({
      ...req.body,
      owner: req.user.userId
    });
    await newTruck.save();
    res.status(201).json(newTruck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyTrucks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userId = req.user.userId;
    const query = { owner: userId };
    if (search) {
      query.$or = [
        { immatriculation: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } }
      ];
    }
    const [trucks, total] = await Promise.all([
      Truck.find(query)
        .sort({ immatriculation: 1 })
        .skip(skip)
        .limit(limit),
      Truck.countDocuments(query)
    ]);
    res.json({
      trucks,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!truck) return res.status(404).json({ message: "Camion non trouvé" });
    res.json({ message: "Camion supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrucksWithEcheances = async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.userId }).select("assurance vidange visiteTechnique");
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const dateThreshold = new Date(now.getTime() + DATE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

    const trucks = await Truck.find({ owner: userId });
    const alerts = trucks.map(truck => {
      const alert = { immatriculation: truck.immatriculation, marque: truck.marque, _id: truck._id };
      // Vidange (oil change)
      if (truck.vidange && typeof truck.vidange.kilometrageRestant === 'number') {
        if (truck.vidange.kilometrageRestant <= 0) {
          alert.vidange = 'overdue';
        } else if (truck.vidange.kilometrageRestant <= VIDANGE_KM_THRESHOLD) {
          alert.vidange = 'soon';
        }
      }
      // Assurance (insurance)
      if (truck.assurance && truck.assurance.echeance) {
        const assuranceDate = new Date(truck.assurance.echeance);
        if (assuranceDate < now) {
          alert.assurance = 'overdue';
        } else if (assuranceDate <= dateThreshold) {
          alert.assurance = 'soon';
        }
      }
      // Visite Technique (technical inspection)
      if (truck.visiteTechnique && truck.visiteTechnique.echeance) {
        const vtDate = new Date(truck.visiteTechnique.echeance);
        if (vtDate < now) {
          alert.visiteTechnique = 'overdue';
        } else if (vtDate <= dateThreshold) {
          alert.visiteTechnique = 'soon';
        }
      }
      // Carte Grise (registration)
      if (truck.echeanceCarteGrise) {
        const cgDate = new Date(truck.echeanceCarteGrise);
        if (cgDate < now) {
          alert.carteGrise = 'overdue';
        } else if (cgDate <= dateThreshold) {
          alert.carteGrise = 'soon';
        }
      }
      return alert;
    }).filter(alert => alert.vidange || alert.assurance || alert.visiteTechnique || alert.carteGrise);

    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
