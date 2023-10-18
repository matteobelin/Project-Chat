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






app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));



app.get('/', verifyToken, (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'));
});

app.use('/login', loginRouter);
app.use('/signup',signUpRouter)
app.get('/getPseudo', verifyToken, (req, res) => {
  const pseudo = req.user;
  res.json({ pseudo });
});


require('./app/chat')(io);
  
  

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});