// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { signUpUser, loginUser, getCurrentUser, getUserProfile, logoutUser } = require('../controllers/userController');

// Definir rotas de usuário
router.post('/signup', signUpUser);
router.post('/login', loginUser);
router.get('/current_user', getCurrentUser);
router.get('/profiles/:id', getUserProfile); // Ensure this line is correct
router.post('/logout', logoutUser);

module.exports = router;