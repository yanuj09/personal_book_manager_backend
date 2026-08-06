const express = require('express');
const connectDb = require("./config/database");
const cookieParser = require('cookie-parser');
const cors = require('cors');

require("dotenv").config({ override: true });

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env');
}

const app = express();
const port = process.env.PORT || 3567;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://personal-book-manager-ui-neon.vercel.app/',
  'http://localhost:3000',
  'http://127.0.0.1:3000',

].filter(Boolean);


// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cookieParser());
// Middleware to parse JSON body
app.use(express.json());


const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const bookRouter = require('./routes/books');


app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/books', bookRouter);

app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'CORS blocked for this origin' });
    return;
  }
  next(err);
});




app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Catch-all 404 handler: runs only if no route above matched the request.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Failed to connect to the database:", err);
  process.exit(1); // Exit the process with failure
});

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// })