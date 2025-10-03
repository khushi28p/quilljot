import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {generateContent} from '../controllers/aiController.js'

const aiRouter = express.Router();

aiRouter.post('/generate', protect, generateContent);

export default aiRouter;