const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  typeDepense: { type: mongoose.Schema.Types.ObjectId, ref: "TypeDepense", required: true },
  modePaiement: { type: String, enum: ["cheque", "virement", "versement", "especes", "MAD", "effet"], required: true },
  beneficiaire: { type: String, required: true },
  camion: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" }
}, { timestamps: true });

module.exports = mongoose.model("Expense", ExpenseSchema); 