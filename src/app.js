const express = require('express');
const app = express();
const port = 4000;


// Middleware to parse JSON body
app.use(express.json());

app.get("/login" , (req,res) => {

  const { username, password } = req.body;

  if (username === "nirahu" && password === "1234") {
    res.send("Login successful");
  }
})

app.post("/signup" , (req,res) => {

  const {firstName, lastName, DOB ,email, password} = req.body;

  if (firstName && lastName && email && password) {
    res.send(`Signup successful for ${firstName} ${lastName} with email ${email}`);
  }

})

app.get('/', (req, res) => {
  res.send('Hello Nirahu!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})