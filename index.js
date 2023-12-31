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


app.get('/addFriend', verifyToken,(req, res)=>{
  res.redirect('/')
} )

app.post('/addFriend', verifyToken, async (req, res) => {
  const pseudo = req.user;
  const friend = req.body.rechercher;

  if (pseudo === friend) {

    res.send(`<!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width,initial-scale=1.0">
              <title>Chat</title>
              <link rel="stylesheet" href="../public/styles.css">
              <link rel="stylesheet" href="../public/reset.css">
              <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
            </head>
            <body>
              <div class="flexbox">
                <div class="left">
                  <div class="logout">
                    <a  href="/logout">log out</a>
                  </div>
                  <div>
                    <form action="/addFriend" method="post">
                      <input class="inputForm" type="text" name="rechercher" placeholder="Search friend">
                    </form>
                    <div class="error">* Impossible de s'ajouter soi-même en ami</div>
                  </div>
                  <div class="ul-container">
                    <ul id="friend">
                    </ul>
                  </div>
                </div>
                <div class="chat">
                  <div class="ul-container">
                    <ul id="messages"></ul>
                  </div>
                  <div id="isWritting"></div>
                  <form id="form" action="">
                    <input class="toSend" id="msgInput" autocomplete="off" />
                  </form> 
                </div>
              
              </div>
                <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
                <script src="../public/chat.js"></script>
            </body>
          </html>`
            );
  } else {
    Friend.find({ $or: [{ pseudo1: pseudo, pseudo2: friend }, { pseudo1: friend, pseudo2: pseudo }] })
      .then((existingFriends) => {
        if (existingFriends.length === 0) {
          User.findOne({ pseudo: friend })
            .then((user) => {
              if (user) {
                const newFriend = new Friend();
                newFriend.pseudo1 = pseudo;
                newFriend.pseudo2 = friend;
                newFriend.save()
                  .then(() => {
                    res.redirect('/');
                  })
                  .catch((error) => {
                    res.status(500).send("Erreur lors de l'ajout de l'ami : " + error);
                  });
              } else {
                res.send(`<!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width,initial-scale=1.0">
                    <title>Chat</title>
                    <link rel="stylesheet" href="../public/styles.css">
                    <link rel="stylesheet" href="../public/reset.css">
                    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
                  </head>
                  <body>
                    <div class="flexbox">
                      <div class="left">
                        <div class="logout">
                          <a  href="/logout">log out</a>
                        </div>
                        <div>
                          <form action="/addFriend" method="post">
                            <input class="inputForm" type="text" name="rechercher" placeholder="Search friend">
                          </form>
                          <div class="error">* Utilisateur non trouvé</div>
                        </div>
                        <div class="ul-container">
                          <ul id="friend">
                          </ul>
                        </div>
                      </div>
                      <div class="chat">
                        <div class="ul-container">
                          <ul id="messages"></ul>
                        </div>
                        <div id="isWritting"></div>
                        <form id="form" action="">
                          <input class="toSend" id="msgInput" autocomplete="off" />
                        </form> 
                      </div>
                    
                    </div>
                      <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
                      <script src="../public/chat.js"></script>
                  </body>
                </html>`
                  );
              }
            })
            .catch((error) => {
              res.status(500).send("Erreur lors de la recherche de l'utilisateur : " + error);
            });
        } else {
          res.send(`<!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width,initial-scale=1.0">
              <title>Chat</title>
              <link rel="stylesheet" href="../public/styles.css">
              <link rel="stylesheet" href="../public/reset.css">
              <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
            </head>
            <body>
              <div class="flexbox">
                <div class="left">
                  <div class="logout">
                    <a  href="/logout">log out</a>
                  </div>
                  <div>
                    <form action="/addFriend" method="post">
                      <input class="inputForm" type="text" name="rechercher" placeholder="Search friend">
                    </form>
                    <div class="error">* L'amitié existe déjà</div>
                  </div>
                  <div class="ul-container">
                    <ul id="friend">
                    </ul>
                  </div>
                </div>
                <div class="chat">
                  <div class="ul-container">
                    <ul id="messages"></ul>
                  </div>
                  <div id="isWritting"></div>
                  <form id="form" action="">
                    <input class="toSend" id="msgInput" autocomplete="off" />
                  </form> 
                </div>
              
              </div>
                <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
                <script src="../public/chat.js"></script>
            </body>
          </html>`
            );
          
        }
      })
      .catch((error) => {
        res.status(500).send("Erreur lors de la recherche d'amitié : " + error);
      });
  }
})

app.get('/logout',verifyToken,(req,res)=>{
  const cookieValue = `jwtToken=; HttpOnly; Secure; Max-Age=-1; Path=/`;
  res.setHeader('Set-Cookie', cookieValue);
  res.redirect('/');
})

require('./app/chatserver')(io);
  
  

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});