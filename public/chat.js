const socket = io();

        while(!pseudo){
         var pseudo = prompt('Quel est ton pseudo ?')
        }

        socket.emit('pseudo',pseudo)

        const form = document.getElementById('form');
        const msgInput = document.getElementById('msgInput');
        const messages = document.getElementById('messages');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (msgInput.value) {
              const message = {
                pseudo: pseudo,
                texte: msgInput.value
              };
              socket.emit('chat message', message);
              msgInput.value = '';
         }
        });
  
        socket.on('chat message', (msg) => {
          const item = document.createElement('li');
          item.style.whiteSpace = "pre-line";
          item.textContent = msg;
          messages.appendChild(item);
          window.scrollTo(0, document.body.scrollHeight);
  });