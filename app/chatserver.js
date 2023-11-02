const mongoose = require('mongoose');
const {getIdByPseudo,getReceiverById}=require('../middlewares/authMiddleware') 
const {getUser}=require('../middlewares/authMiddleware') 
const {readToken}=require('../middlewares/authMiddleware')
require('../models/chat.models');


var Chat=mongoose.model('chat')
const connectedUsers=new Map();


module.exports=function(io){
    io.on('connection', (socket) => {
        var lastPseudo = '';
        var lastReceiver='';
        
        
        socket.on('pseudo',(receiver)=>{
  
          socket.pseudo=readToken(socket.request.headers.cookie)
          socket.receiver=receiver
          const userData = {
            pseudo: socket.pseudo, 
            receiver: socket.receiver,
          };
          if(!connectedUsers.has(socket.id)){
            connectedUsers.set(socket.id,userData)
          }
          else{
            connectedUsers.delete(socket.id);
            connectedUsers.set(socket.id,userData)
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
                    if(lastPseudo!==socket.pseudo && lastReceiver!==receiver){
                      var message=socket.pseudo+'\n'+msg.texte
                      if(getIdByPseudo(receiver,connectedUsers) && getReceiverById(getIdByPseudo(receiver,connectedUsers),connectedUsers)===receiver){
                        socketUser=getIdByPseudo(receiver,connectedUsers);
                        socket.to(socketUser).emit('messageAll',message );
                      }
                      socket.emit('messageMe', socket.pseudo+'\n'+msg.texte);
                      chat.content=message;
                      chat.sender=socket.pseudo;
                      chat.receiver=receiver;
                      lastPseudo=socket.pseudo;
                      lastReceiver=receiver
                    }else{
                      if(getIdByPseudo(receiver,connectedUsers)&& getReceiverById(getIdByPseudo(receiver,connectedUsers),connectedUsers)===receiver){
                        socketUser=getIdByPseudo(receiver,connectedUsers);
                        socket.to(socketUser).emit('messageAll', msg.texte);
                      }
                      socket.emit('messageMe', msg.texte);
                      chat.content=msg.texte;
                      chat.sender=socket.pseudo;
                      chat.receiver=receiver;
                  
                    }
  
                    chat.save();
                  }
              }
            })
            
            
        });
    
        socket.on('writting',(receiver)=>{
            if(getIdByPseudo(receiver,connectedUsers)){
              socketUser=getIdByPseudo(receiver,connectedUsers);
              if(getReceiverById(socketUser,connectedUsers) ===socket.pseudo){
                socket.to(socketUser).emit('writting',socket.pseudo+' est en train d\'écrire');
              }  
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