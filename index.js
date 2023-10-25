const express = require('express');
const { createServer } = require('node:http');
const bodyParser = require('body-parser');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { verifyToken } = require('./middlewares/authMiddleware');
const loginRouter = require('./app/logIn');
const signUpRouter = require('./app/signUp');




const app = express();
const server = createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://127.0.0.1:27017/ProjectChat').then(() => console.log('Connected!'));

require('./models/friend.models');
require('./models/user.models');

var Friend=mongoose.model('friend');
var User=mongoose.model('user');




app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));



app.get('/', verifyToken, (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'));
});

app.use('/login', loginRouter)
app.use('/signup',signUpRouter)
app.post('/getPseudo', verifyToken, (req, res) => {
  const pseudo = req.user;
  res.json({ pseudo });
});

app.post('/getFriend',verifyToken, (req, res) => {
  const pseudo=req.user;
  const friendData = [];


  Friend.find().then((users)=>{
    users.forEach((user)=>{
      if(user.pseudo1==pseudo || user.pseudo2==pseudo){
        if(user.pseudo1==pseudo){
          friendData.push(user.pseudo2);
        }
        else{
          friendData.push(user.pseudo1);
        }
      }
      
    })
    res.json({ friendData });
  })
  
  
});



app.post('/addFriend', verifyToken, async (req, res) => {
  const pseudo = req.user;
  const friend = req.body.rechercher;
  let utilisateurTrouve = false;

  if (pseudo === friend) {
    res.send("Impossible de s'ajouter soi-même en ami.");
  } else {
    User.find().then((users) => {
      users.forEach((user) => {
        if (user.pseudo === friend) {
          const newFriend = new Friend();
          newFriend.pseudo1 = pseudo;
          newFriend.pseudo2 = friend;
          newFriend.save();
          utilisateurTrouve = true;
        }
      });

      if (utilisateurTrouve) {
        res.redirect('/');
      } else {
        res.send('Utilisateur non trouvé');
      }
    });
  }
});

require('./app/chatserver')(io);
  
  

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});