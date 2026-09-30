import express from 'express';
import cors from 'express';
import chatRoutes from './routes/chat';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());

// Enable CORS properly for preflight OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Rate limiting: max 20 requests per 15 minutes per session (IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this session, please try again later.', fallback: true },

  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting strictly to AI routes
app.use('/api/chat', apiLimiter, chatRoutes);

export default app;
