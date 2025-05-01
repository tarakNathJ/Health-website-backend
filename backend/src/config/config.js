import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET || 'health_connect_jwt_secret_key',
    jwtExpiresIn: '7d'
};

export default config; 