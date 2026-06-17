const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all products/services
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post('/', async (req, res) => {
  const { locationId, name, category, price, stock } = req.body;
  const product = await prisma.product.create({
    data: { locationId, name, category, price, stock }
  });
  res.json(product);
});

module.exports = router;
