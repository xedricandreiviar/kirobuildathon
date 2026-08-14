import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes — all under /api prefix
app.use('/api', apiRoutes);

// Global error handler — no stack traces to client (BRD §8)
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server (skip in Vercel serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Ready Ka Ba API running on http://localhost:${PORT}`);
  });
}

export default app;
