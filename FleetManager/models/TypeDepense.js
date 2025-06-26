const mongoose = require('mongoose');

const TypeDepenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['camion', 'divers'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TypeDepense', TypeDepenseSchema); 