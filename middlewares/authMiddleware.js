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


function readToken(cookies) {
  if (!cookies) {
    return res.redirect('/login');;
  }

  const tokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('jwtToken='));

  if (!tokenCookie) {
    return res.redirect('/login');
  }

  const token = tokenCookie.split('=')[1];

  try {
    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8');
    const decoded = jwt.verify(token, publicKey);
    return decoded;
  } catch (error) {
    console.error('Erreur :', error);
    throw new Error('Erreur du serveur interne');
  }
}





function getIdByPseudo(pseudoToFind,connectedUsers) {
  let socketId = null;
  connectedUsers.forEach((value, key) => {
    if (value.pseudo === pseudoToFind) {
      socketId = key;
      return; 
    }
  });
  return socketId;
}


function getReceiverById(socketId,connectedUsers) {
  let receiver = null;
  connectedUsers.forEach((value, key) => {
    if (key === socketId) {
      receiver = value.receiver;
      return; 
    }
  });
  return receiver;
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
  verifyToken,getIdByPseudo,getUser,readToken,getReceiverById
};

