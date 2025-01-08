const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    currentStock: { type: Number, required: true },
    leadTime: { type: Number, required: true }, // Tiempo de reposición en días
    safetyStock: { type: Number, default: 0 }, // Stock de seguridad
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
