import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../shared/logger.js';

let isConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  try {
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    logger.info(`MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      const sanitizedErr = (err instanceof Error ? err.message : String(err)).replace(/:([^@/]+)@/, ':***@');
      logger.error('MongoDB connection error:', sanitizedErr);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return true;
  } catch (error) {
    isConnected = false;
    const sanitizedMsg = (error instanceof Error ? error.message : 'Unknown error').replace(/:([^@/]+)@/, ':***@');
    logger.warn(`MongoDB initial connection failed: ${sanitizedMsg}`);
    logger.info('Running in offline/unconnected DB mode. Health check will report DB status.');
    return false;
  }
};

export const getDatabaseHealth = () => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: readyState === 1 ? 'healthy' : 'unhealthy',
    state: states[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
  };
};

export const disconnectDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed.');
  }
};
