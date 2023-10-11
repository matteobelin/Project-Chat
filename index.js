const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);


app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'));
});


  io.on('connection', (socket) => {
    var lastPseudo = '';

    socket.on('pseudo',(pseudo)=>{
      socket.pseudo=pseudo;
    })

    socket.on('chat message', (msg) => {

      
        if(lastPseudo!==msg.pseudo){
          socket.emit('messageMe', msg.pseudo+'\n'+msg.texte);
          socket.broadcast.emit('messageAll', msg.pseudo+'\n'+msg.texte);
          lastPseudo=msg.pseudo;
        }else{
          socket.emit('messageMe', msg.texte);
          socket.broadcast.emit('messageAll', msg.texte);
        }
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