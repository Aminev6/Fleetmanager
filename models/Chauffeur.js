const mongoose = require('mongoose');

const ChauffeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  cin: { type: String, required: true },
  adresse: { type: String },
  telephone: { type: String },
  etat: { type: String, enum: ['disponible', 'indisponible'], default: 'disponible' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Chauffeur', ChauffeurSchema); 