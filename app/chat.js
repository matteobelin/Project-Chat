const mongoose = require('mongoose'); 
require('../models/chat.models');

var Chat=mongoose.model('chat')

module.exports=function(io){
    io.on('connection', (socket) => {
        var lastPseudo = '';
        
        
        socket.on('pseudo',(pseudo)=>{
          socket.pseudo=pseudo
          Chat.find().then((messages) => {
            messages.forEach((message) => {
              if (message.sender == socket.pseudo) {
                socket.emit('messageMe', message.content);
              }else {
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
}