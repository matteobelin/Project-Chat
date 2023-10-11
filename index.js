const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const ObjectId=mongoose.Types.ObjectId;

const app = express();
const server = createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://127.0.0.1:27017/ProjectChat')
  .then(() => console.log('Connected!'));

require('./models/chat.models');
require('./models/user.models');

var User=mongoose.model('user')
var Chat=mongoose.model('chat')


app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'));
});


  io.on('connection', (socket) => {
    var lastPseudo = '';

    socket.on('pseudo',(pseudo)=>{
      User.findOne({ pseudo: pseudo }).then(user => {
        if (user) {
          socket.pseudo = pseudo;
        }else {
          var newUser = new User();
          newUser.pseudo = pseudo;
          newUser.save().then(() => {
            socket.pseudo = pseudo;
          })
        }
      })
      Chat.find().then((messages) => {
          messages.forEach((message) => {
            if (message.sender === socket.pseudo) {
              socket.emit('messageMe', message.content);
            } else {
              socket.emit('messageAll', message.content);
            }
          });
      })
    })

    socket.on('chat message', (msg) => {
        var chat= new Chat;
        
        if(lastPseudo!==msg.pseudo){
          var message=msg.pseudo+'\n'+msg.texte

          socket.emit('messageMe', msg.pseudo+'\n'+msg.texte);
          socket.broadcast.emit('messageAll',message );

          chat.content=message;
          chat.sender=msg.pseudo;
          lastPseudo=msg.pseudo;
        }else{
          socket.emit('messageMe', msg.texte);
          socket.broadcast.emit('messageAll', msg.texte);

          chat.content=msg.texte;
          chat.sender=msg.pseudo;
        }
        chat.save();
    });

    socket.on('writting',(write)=>{
        socket.broadcast.emit('writting',write+' est en train d\'écrire');
    })

    socket.on('notWritting',()=>{
      socket.broadcast.emit('notWritting')
    })
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});