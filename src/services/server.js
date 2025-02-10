const express = require('express');
const bodyParser = require('body-parser');
const { signup } = require('./authService');
const authorize = require('./middleware/authMiddleware');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const result = await signup(email, password, name);
    res.status(201).json({ message: 'User registered successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route chỉ cho phép admin
app.get('/api/admin', authorize(['admin']), (req, res) => {
  res.send('Welcome Admin!');
});

// Route cho tất cả người dùng
app.get('/api/user', authorize(['user', 'admin']), (req, res) => {
  res.send('Welcome User!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});