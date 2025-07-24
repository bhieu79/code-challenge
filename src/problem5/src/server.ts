import express, { Request, Response } from 'express';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes';
import { HealthResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req: Request, res: Response<HealthResponse>) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/resources', resourceRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Start server only when this file is run directly (not when imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

export default app;
