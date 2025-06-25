const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
  immatriculation: { type: String, required: true },
  marque: { type: String, required: true },
  assurance: {
    montant: Number,
    echeance: Date
  },
  visiteTechnique: {
    echeance: Date
  },
  vidange: {
    kilometrage: Number,
    kilometrageRestant: Number
  },
  kilometrageActuel: { type: Number, default: 0 },
  etat: { type: String, enum: ['en_mission', 'disponible'], default: 'disponible' },
  totalDepenses: { type: Number, default: 0 },
  totalRevenus: { type: Number, default: 0 },
  dateAcquisition: { type: Date },
  numeroCarteGrise: { type: String },
  echeanceCarteGrise: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Truck', TruckSchema);
