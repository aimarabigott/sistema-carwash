const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const expenses = await prisma.expense.findMany();
  res.json(expenses);
});

router.post('/', async (req, res) => {
  const { locationId, workerId, amount, concept } = req.body;
  const expense = await prisma.expense.create({
    data: { locationId, workerId, amount, concept }
  });
  res.json(expense);
});

module.exports = router;
