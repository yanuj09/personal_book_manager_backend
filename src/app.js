const express = require('express');
const connectDb = require("./config/database");
const cookieParser = require('cookie-parser');

require("dotenv").config();

const app = express();
const port = 4000;


// Middleware to parse JSON body
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const bookRouter = require('./routes/books');


app.use('/', authRouter);
app.use('/' , profileRouter);
app.use('/', bookRouter);




app.use('/*', (req, res) => {
  res.send('Hello Nirahu!');
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