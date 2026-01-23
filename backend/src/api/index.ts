import express from 'express';
import cors from 'cors';
import generateRoutes from './routes/generate';
import statusRoutes from './routes/status';
import contentRoutes from './routes/content';
import compatibilityRoutes from './routes/compatibility';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({status: 'ok', service: 'video-render-api'});
});

// API routes
app.use('/api/video', generateRoutes);
app.use('/api/video', statusRoutes);
app.use('/api', contentRoutes);
app.use('/api/compatibility', compatibilityRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Render API listening on port ${PORT}`);
});

export default app;
