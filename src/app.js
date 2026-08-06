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


// Middleware to parse JSON body
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const bookRouter = require('./routes/books');


app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/books', bookRouter);




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