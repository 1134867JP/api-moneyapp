// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { signUpUser  } = require('../controllers/userController');

// Definir rotas de usuário
router.post('/signup', signUpUser );

module.exports = router;