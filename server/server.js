require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const { signUpUser } = require('./controllers/userController'); 
const { supabase } = require('./config/supabaseClient');        

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

app.post('/signup', upload.single('profileImage'), signUpUser);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});