const jwt = require('jsonwebtoken');
const fs = require('fs');

const publicKeyPath = './config/publicKey.pem'; // Assurez-vous que le chemin est correct




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

module.exports = {
  verifyToken,
};

