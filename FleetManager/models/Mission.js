const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema(
  {
    departDate: { type: Date, required: true },
    expectedDate: { type: Date, required: true },
    returnDate: { type: Date },
    chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: "Chauffeur", required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck", required: true },
    revenue: { type: Number },
    status: {
      type: String,
      enum: ["en_cours", "en_retard", "terminee"],
      default: "en_cours"
    },
    kilometrageRetour: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mission", MissionSchema);
