const Expense = require("../models/Expense");
const mongoose = require('mongoose');

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, date, typeDepense, modePaiement, beneficiaire, camion } = req.body;
    const expense = new Expense({
      user: req.user.userId,
      amount,
      description,
      date,
      typeDepense,
      modePaiement,
      beneficiaire,
      camion: camion || undefined
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.userId;
    const query = { user: userId };
    if (req.query.typeDepense) query.typeDepense = req.query.typeDepense;
    if (req.query.camion) query.camion = req.query.camion;
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('typeDepense')
        .populate('camion')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query)
    ]);
    // Map for display
    const mapped = expenses.map(e => ({
      _id: e._id,
      date: e.date,
      typeDepenseName: e.typeDepense?.name,
      amount: e.amount,
      modePaiement: e.modePaiement,
      beneficiaire: e.beneficiaire,
      camionImmat: e.camion?.immatriculation,
      description: e.description
    }));
    res.json({
      expenses: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
