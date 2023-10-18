const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('../models/user.models'); 
const User = mongoose.model('user');

// Importez votre modèle User


// Route GET pour afficher le formulaire de connexion
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/logIn.html'));
});

// Route POST pour gérer la soumission du formulaire de connexion
router.post('/', async (req, res) => {
    try {
      const users = await User.find({ email: req.body.email });
      if (users.length > 0) {
        let verif = await bcrypt.compare(req.body.password, users[0].password);
        if (!verif) {
          res.status(400).send('Password ou Email incorrect');
          return;
        }
  
        const privateKeyPath = './config/privateKey.pem'; 
        fs.readFile(privateKeyPath, 'utf8', (err, privateKey) => {
          if (err) {
            return res.redirect('/');
          }
  
          // La clé privée a été lue avec succès
          const token = jwt.sign(users[0].pseudo, privateKey, { algorithm: 'RS256' });
          const cookieValue = `jwtToken=${token}; HttpOnly; Secure; Max-Age=86400; Path=/`;
          res.setHeader('Set-Cookie', cookieValue);
          res.redirect('/');
        });
      }else{
        res.send('Password ou Email incorrect')
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

module.exports = router;