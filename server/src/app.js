const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const authRoutes         = require('./routes/auth.routes');
const groupRoutes        = require('./routes/groups.routes');
const contributionRoutes = require('./routes/contributions.routes');
const cycleRoutes        = require('./routes/cycles.routes');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth',          authRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/cycles',        cycleRoutes);
app.use('/api/webhooks', webhookRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

module.exports = app;
