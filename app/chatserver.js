const mongoose = require('mongoose');
const {getIdByPseudo}=require('../middlewares/authMiddleware') 
const {getUser}=require('../middlewares/authMiddleware') 
require('../models/chat.models');


var Chat=mongoose.model('chat')
const connectedUsers=new Map();


module.exports=function(io){
    io.on('connection', (socket) => {
        var lastPseudo = '';
        var lastReceiver='';
        
        
        socket.on('pseudo',(pseudo,receiver)=>{
          socket.pseudo=pseudo
          if(!connectedUsers.has(socket.id)){
            connectedUsers.set(socket.id,socket.pseudo)
          }
          Chat.find().then((messages) => {
            messages.forEach((message) => {
              if (message.sender == socket.pseudo && message.receiver == receiver){
                socket.emit('messageMe', message.content);
              }
              else if(message.sender == receiver && message.receiver == socket.pseudo){
                socket.emit('messageAll', message.content);
              }
        
            });
          })
        })
    
        socket.on('chat message', (msg,receiver) => {
            var chat= new Chat;
            
            getUser(receiver).then((pseudo)=>{
              if(pseudo){
                  {
                    if(lastPseudo!==msg.pseudo && lastReceiver!==receiver){
                      var message=msg.pseudo+'\n'+msg.texte
                      if(getIdByPseudo(receiver,connectedUsers)){
                        socketUser=getIdByPseudo(receiver,connectedUsers);
                        socket.to(socketUser).emit('messageAll',message );
                      }
                      socket.emit('messageMe', msg.pseudo+'\n'+msg.texte);
                      chat.content=message;
                      chat.sender=msg.pseudo;
                      chat.receiver=receiver;
                      lastPseudo=msg.pseudo;
                      lastReceiver=receiver
                    }else{
                      if(getIdByPseudo(receiver,connectedUsers)){
                        socketUser=getIdByPseudo(receiver,connectedUsers);
                        socket.to(socketUser).emit('messageAll', msg.texte);
                      }
                      socket.emit('messageMe', msg.texte);
                      chat.content=msg.texte;
                      chat.sender=msg.pseudo;
                      chat.receiver=receiver;
                  
                    }
  
                    chat.save();
                  }
              }
            })
            
            
        });
    
        socket.on('writting',(write,receiver)=>{
            if(getIdByPseudo(receiver,connectedUsers)){
              socketUser=getIdByPseudo(receiver,connectedUsers);
              socket.to(socketUser).emit('writting',write+' est en train d\'écrire');
              
            }
            
            
        })
    
        socket.on('notWritting',()=>{
          socket.broadcast.emit('notWritting')
        })

        socket.on('disconnected',()=>{
          if (connectedUsers.has(socket.id)) {
            connectedUsers.delete(socket.id);
          }
        })
      });
}