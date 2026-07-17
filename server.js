import express from 'express';
import smsServer from './sms-server.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set default port and host if not set in environment variables
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '192.168.100.50';

// Create express app
const app = express();
app.use(express.json());
app.use(smsServer);

app.use('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'SMS 📲 2FA Gateway Server 🖥️  is running' });
});

app.listen(PORT, HOST, () => {
  console.log(`SMS 📲 2FA Gateway Server 🖥️  is running on port 🌎 ${PORT} on host 🌐 ${HOST}`);
});