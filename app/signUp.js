const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); 

const privateKeyPath = './config/privateKey.pem'; 


const {signUpSchema} = require ('../config/validation');
const saltRounds = 10;

require('../models/user.models');
const User = mongoose.model('user');


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signUp.html'));
  });


router.post('/',async(req,res)=>{
  
    if(req.body.email===req.body.confirm_email){
      try{
        await signUpSchema.validate( req.body,{stripUnknown:true})
        const users = await User.find({ $or: [{ pseudo: req.body.pseudo }, { email: req.body.email }] });
      
        if (users.length === 0) {
          let hash= await bcrypt.hash(req.body.password, saltRounds);
          const newUser = new User();
          newUser.pseudo = req.body.pseudo;
          newUser.email = req.body.email;
          newUser.password = hash;
          await newUser.save();
          fs.readFile(privateKeyPath, 'utf8', (err, privateKey) => {
            if (err) {
              return res.redirect('/');
            }
          const token=jwt.sign(req.body.pseudo, privateKey, { algorithm: 'RS256' });
  
          const cookieValue = `jwtToken=${token}; HttpOnly;Secure; Max-Age=86400; Path=/`;
          res.setHeader('Set-Cookie', cookieValue);
          res.redirect('/');
        
      })}
      else{
        const val=await User.find({ email: req.body.email })
        if(val.length!==0){
          res.send(`
        
          <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>signUp</title>
      <link rel="stylesheet" href="../public/styles.css">
      <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    </head>
    <body>
        <form class="connect" action="" method="post">
          <h1>Signup</h1>
          <div class="svg"></div>
          <div class="flexbox">
            <div class="flexbox">
              <label class="label" for="pseudo">Pseudo</label>
              <input class="inputForm" type="text" name="pseudo" placeholder="Enter pseudo">
            </div>
            <div class="flexbox">
              <label class="label" for="email">Email</label>
              <input class="inputForm" type="email" name="email" placeholder="Enter email">
              <div class="error">* Un utilisateur possede deja cette email</div>
            </div>
            <div class="flexbox">
              <label class="label" for="confirm_email">Confirm email</label>
              <input class="inputForm" type="email" name="confirm_email" placeholder="Confirm email">
            </div>
            <div class="flexbox">
              <label class="label" for="password">Password</label>
              <input class="inputForm" type="password" name="password" placeholder="Enter password" autocomplete="current-password">
            </div>
            <button class="boutton" type="submit" id="submit">Sign up</button>
          </div>
        </form>
    </body>
  </html>
          `)
        }
        else{
          res.send(`
        
          <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>signUp</title>
      <link rel="stylesheet" href="../public/styles.css">
      <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    </head>
    <body>
        <form class="connect" action="" method="post">
          <h1>Signup</h1>
          <div class="svg"></div>
          <div class="flexbox">
            <div class="flexbox">
              <label class="label" for="pseudo">Pseudo</label>
              <input class="inputForm" type="text" name="pseudo" placeholder="Enter pseudo">
              <div class="error">* Un utilisateur possede deja ce pseudo</div>
            </div>
            <div class="flexbox">
              <label class="label" for="email">Email</label>
              <input class="inputForm" type="email" name="email" placeholder="Enter email">
            </div>
            <div class="flexbox">
              <label class="label" for="confirm_email">Confirm email</label>
              <input class="inputForm" type="email" name="confirm_email" placeholder="Confirm email">
            </div>
            <div class="flexbox">
              <label class="label" for="password">Password</label>
              <input class="inputForm" type="password" name="password" placeholder="Enter password" autocomplete="current-password">
            </div>
            <button class="boutton" type="submit" id="submit">Sign up</button>
          </div>
        </form>
    </body>
  </html>
          `)
        }
        
      }
        
      }
        catch(err){
          res.send(`
        
        <!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>signUp</title>
    <link rel="stylesheet" href="../public/styles.css">
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
  </head>
  <body>
      <form class="connect" action="" method="post">
        <h1>Signup</h1>
        <div class="svg"></div>
        <div class="flexbox">
          <div class="flexbox">
          <div class="error">* Champs non respecte</div>
            <label class="label" for="pseudo">Pseudo</label>
            <input class="inputForm" type="text" name="pseudo" placeholder="Enter pseudo">
          </div>
          <div class="flexbox">
            <label class="label" for="email">Email</label>
            <input class="inputForm" type="email" name="email" placeholder="Enter email">
          </div>
          <div class="flexbox">
            <label class="label" for="confirm_email">Confirm email</label>
            <input class="inputForm" type="email" name="confirm_email" placeholder="Confirm email">
          </div>
          <div class="flexbox">
            <label class="label" for="password">Password</label>
            <input class="inputForm" type="password" name="password" placeholder="Enter password" autocomplete="current-password">
          </div>
          <button class="boutton" type="submit" id="submit">Sign up</button>
        </div>
      </form>
  </body>
</html>
        `)
        }
      }
      else{
        res.send(`
        
        <!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>signUp</title>
    <link rel="stylesheet" href="../public/styles.css">
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
  </head>
  <body>
      <form class="connect" action="" method="post">
        <h1>Signup</h1>
        <div class="svg"></div>
        <div class="flexbox">
          <div class="flexbox">
            <label class="label" for="pseudo">Pseudo</label>
            <input class="inputForm" type="text" name="pseudo" placeholder="Enter pseudo">
          </div>
          <div class="flexbox">
            <label class="label" for="email">Email</label>
            <input class="inputForm" type="email" name="email" placeholder="Enter email">
          </div>
          <div class="flexbox">
            <label class="label" for="confirm_email">Confirm email</label>
            <input class="inputForm" type="email" name="confirm_email" placeholder="Confirm email">
            <div class="error">* Email different</div>
          </div>
          <div class="flexbox">
            <label class="label" for="password">Password</label>
            <input class="inputForm" type="password" name="password" placeholder="Enter password" autocomplete="current-password">
          </div>
          <button class="boutton" type="submit" id="submit">Sign up</button>
        </div>
      </form>
  </body>
</html>
        `)
      }
  
  })

  module.exports = router;
