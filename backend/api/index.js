import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import config from '../src/config/config.js';
import connectDB from '../src/config/db.js';
import authRoutes from '../src/routes/authRoutes.js';
import passwordRoutes from '../src/routes/passwordRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('HealthConnect API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: config.nodeEnv === 'production' ? null : err.stack,
    });
});

// Export as serverless function for Vercel
export default app; 