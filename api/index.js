// This is a serverless function wrapper for your backend
// Note: This won't work with Socket.io due to Vercel's limitations
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Note: Socket.io and persistent connections won't work on Vercel
// You'll need to use a different real-time solution or deploy backend elsewhere

export default app;
