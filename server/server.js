import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import {connectDB} from './config/db.js'
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport.js';
import {errorHandler} from './middleware/errorMiddleware.js'

import authRouter from './routes/authRoutes.js';
import postRouter from './routes/postRoutes.js';
import aiRouter from './routes/aiRoutes.js';

dotenv.config();

connectDB();

initializePassport();

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
]

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.JWT_SECRET, // Use the same secret for simplicity, or define a new one
    resave: false,                 // Don't save session if unmodified
    saveUninitialized: false,      // Don't create session until something is stored
    cookie: { secure: process.env.NODE_ENV === 'production' ? true : false, sameSite: 'lax' }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('API is running,...');
})

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/ai', aiRouter);

app.use((req, res, next) => {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
