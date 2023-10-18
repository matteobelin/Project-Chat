
const socket = io();
let pseudo;
            
document.addEventListener('DOMContentLoaded', () => {
 
  fetch('/getPseudo', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      
      pseudo=data.pseudo

      socket.emit('pseudo',pseudo)
        
        const form = document.getElementById('form');
        const msgInput = document.getElementById('msgInput');
        const messages = document.getElementById('messages');
        
        form.addEventListener('input',()=>{
          if(msgInput.value.trim()!==''){
            socket.emit('writting',pseudo)
          }else{
            socket.emit('notWritting')
          } 
        })

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (msgInput.value) {
              const message = {
                pseudo: pseudo,
                texte: msgInput.value
              };
              socket.emit('chat message', message);
              msgInput.value = '';
              socket.emit('notWritting')
         }
        });


        socket.on('writting',(pseudo)=>
        {
          document.getElementById('isWritting').textContent = pseudo
        })


        socket.on('notWritting',()=>{
          document.getElementById('isWritting').textContent=''
        })


        socket.on('messageAll', (msg) => {
          const item = document.createElement('li');
          item.classList.add('all')
          item.style.whiteSpace = "pre-line";
          item.style.color="red"
          item.textContent = msg;
          messages.appendChild(item);
          window.scrollTo(0, document.body.scrollHeight);
        });

        
        socket.on('messageMe', (msg) => {
            const item = document.createElement('li');
          item.classList.add('me')
          item.style.whiteSpace = "pre-line"
          item.style.color="blue";
          item.textContent = msg;
          messages.appendChild(item);
          window.scrollTo(0, document.body.scrollHeight);
      });
      
    })
    .catch(error => {
      console.error('Erreur lors de la récupération du pseudo :', error);
    });
});
            
        

        
        
