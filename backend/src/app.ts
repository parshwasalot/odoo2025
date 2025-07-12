import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import connectDB from './utils/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import itemRoutes from './routes/item.routes';
import swapRoutes from './routes/swap.routes';
import pointsRoutes from './routes/points.routes';
import adminRoutes from './routes/admin.routes';
import SocketService from './utils/socket';
import { errorHandler } from './middleware/error';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket service
const socketService = new SocketService(io);
app.set('socketService', socketService);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Serve static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/admin', adminRoutes);

// Connect to Database
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ReWear API is running' });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io available throughout the app
app.set('io', io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
