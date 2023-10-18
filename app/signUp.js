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
        res.send('Un utilisateur possede deja ce nom et/ou email')
      }
        
      }
        catch(err){
          res.send('champ non respecte')
        }
      }
      else{
        res.send('Email different')
      }
  
  })

  module.exports = router;
