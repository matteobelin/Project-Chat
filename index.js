const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
var lastPseudo = ''

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'));
});


  io.on('connection', (socket) => {
    socket.on('pseudo',(pseudo)=>{
      socket.pseudo=pseudo
    })

    socket.on('chat message', (msg) => {
      if(lastPseudo!==msg.pseudo){
        io.emit('chat message', msg.pseudo+'\n'+msg.texte)
        lastPseudo=msg.pseudo
      }else{
        io.emit('chat message', msg.texte)
      }
      
    });
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});