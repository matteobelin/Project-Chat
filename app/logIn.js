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
          res.send(`<!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <link rel="stylesheet" href="../public/styles.css">
            <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
            <title>logIn</title>
          </head>
          <body>
              <form class="connect" action="" method="post">
                <h1>Login</h1>
                <div class="svg"></div>
                <div class="flexbox">
                  <div class="flexbox">
                    <label class="label" for="email">Email</label>
                    <input class="inputForm" type="email" name="email" placeholder="Enter email">
                    <div class="error">* Password or Email incorrect</div>
                  </div>
                  <div class="flexbox">
                    <label class="label" for="password">Password</label>
                    <input class="inputForm" type="password" name="password"  placeholder="Enter password" autocomplete="current-password">
                  </div>
                  <button class="boutton" type="submit">Log in</button>
                  <p>Don't have account ? <a href="/signup">Create account</a></p>
                  
                </div>
              </form>
          </body>
        </html>`)
          return;
        }
  
        const privateKeyPath = './config/privateKey.pem'; 
        fs.readFile(privateKeyPath, 'utf8', (err, privateKey) => {
          if (err) {
            return res.redirect('/');
          }
  
          // La clé privée a été lue avec succès
          const token = jwt.sign(users[0].pseudo, privateKey, { algorithm: 'RS256' })          
          const cookieValue = `jwtToken=${token}; HttpOnly; Secure; Max-Age=86400; Path=/`;
          res.setHeader('Set-Cookie', cookieValue);
          res.redirect('/');
        });
      }else{
        res.send(`<!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <link rel="stylesheet" href="../public/styles.css">
            <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
            <title>logIn</title>
          </head>
          <body>
              <form class="connect" action="" method="post">
                <h1>Login</h1>
                <div class="svg"></div>
                <div class="flexbox">
                  <div class="flexbox">
                  <div>* Password or Email incorrect</div>
                    <label class="label" for="email">Email</label>
                    <input class="inputForm" type="email" name="email" placeholder="Enter email">
                  </div>
                  <div class="flexbox">
                    <label class="label" for="password">Password</label>
                    <input class="inputForm" type="password" name="password"  placeholder="Enter password" autocomplete="current-password">
                  </div>
                  <button class="boutton" type="submit">Log in</button>
                  <p>Don't have account ? <a href="/signup">Create account</a></p>
                  
                </div>
              </form>
          </body>
        </html>`)
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

module.exports = router;