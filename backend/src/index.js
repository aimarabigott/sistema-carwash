const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const productsRoutes = require('./routes/products');
const whatsappRoutes = require('./routes/whatsapp');
const expensesRoutes = require('./routes/expenses');
const workersRoutes = require('./routes/workers');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/workers', workersRoutes);

module.exports = app;
if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}
