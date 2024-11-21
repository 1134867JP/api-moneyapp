const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Ensure this path is correct
const userController = require('./controllers/userController'); // Add this line

const app = express();
const port = 3000;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure this route is defined after body-parser middleware
app.post('/login', userController.loginUser);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

app.use('/auth', authRoutes); // Usar as rotas de autenticação

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});