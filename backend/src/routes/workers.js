const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const workers = await prisma.workerProfile.findMany({ include: { user: true } });
  res.json(workers);
});

router.post('/', async (req, res) => {
  const { name, email, password, locationId, commissionType, commissionValue } = req.body;
  
  const user = await prisma.user.create({
    data: {
      email,
      password,
      role: 'WORKER',
      workerProfile: {
        create: {
          locationId,
          commissionType,
          commissionValue
        }
      }
    },
    include: { workerProfile: true }
  });
  
  res.json(user);
});

module.exports = router;
