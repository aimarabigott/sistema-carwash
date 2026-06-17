const express = require('express');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  // Dummy analytics return for the top cards to allow UI building
  res.json({
    todayIncome: 1250,
    todayWashes: 45,
    todayExpenses: 150,
    averageTicket: 27.7
  });
});

module.exports = router;
