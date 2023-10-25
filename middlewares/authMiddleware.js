const jwt = require('jsonwebtoken');
const fs = require('fs');

const publicKeyPath = './config/publicKey.pem'; // Assurez-vous que le chemin est correct
const mongoose = require('mongoose');
require('../models/user.models')

var User=mongoose.model('user')



function verifyToken(req, res, next) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.redirect('/login');
  }

  const tokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('jwtToken='));

  if (!tokenCookie) {
    return res.redirect('/login');
  }

  const token = tokenCookie.split('=')[1];

  // Lire la clé publique depuis le fichier
  fs.readFile(publicKeyPath, 'utf8', (err, publicKey) => {
    if (err) {
      return res.redirect('/login');
    }

    jwt.verify(token, publicKey, (jwtErr, decoded) => {
      if (jwtErr) {
        return res.redirect('/login');
      }

      req.user = decoded;

      next();
    });
  });
}

function getIdByPseudo(pseudoToFind,connectedUsers) {
  let socketId = null;
  connectedUsers.forEach((value, key) => {
    if (value === pseudoToFind) {
      socketId = key;
      return; 
    }
  });
  return socketId;
}

function getUser(receiver) {
  return User.find().then((users) => {
    let perso = null;

    users.forEach((user) => {
      if (user.pseudo === receiver) {
        perso = user.pseudo;
      }
    });

    return perso;
  });
}
 


module.exports = {
  verifyToken,getIdByPseudo,getUser
};

