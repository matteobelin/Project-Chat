const socket = io();
let receiver;


function createFriendLink(element) {
  const link = document.createElement('a');
  link.textContent = element;
  link.classList = 'onclick';
  link.href = '';
  link.addEventListener('click', (event) => {
    event.preventDefault();
    clearMessages();
    receiver = event.target.textContent;
    socket.emit('pseudo',receiver);
    
  });

  return link;
}


function clearMessages() {
  const allElements = document.querySelectorAll('li.all');
  allElements.forEach(element => element.remove());

  const meElements = document.querySelectorAll('li.me');
  meElements.forEach(element => element.remove());
}


      fetch('/getFriend', {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          
          const tab = data.friendData;
          const friendList = document.getElementById('friend');

          tab.forEach(element => {
            const item = document.createElement('li');
            item.appendChild(createFriendLink(element));
            friendList.appendChild(item);
          });

          const form = document.getElementById('form');
          const msgInput = document.getElementById('msgInput');
          const messages = document.getElementById('messages');

          form.addEventListener('input', () => {
            if (msgInput.value.trim() !== '') {
              socket.emit('writting', receiver);
            } else {
              socket.emit('notWritting');
            }
          });

          form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (msgInput.value) {
              const message = {
                texte: msgInput.value,
              };
              socket.emit('chat message', message, receiver);
              msgInput.value = '';
              socket.emit('notWritting');
            }
          });

          socket.on('writting', (pseudo) => {
            document.getElementById('isWritting').textContent = pseudo;
          });

          socket.on('notWritting', () => {
            document.getElementById('isWritting').textContent = '';
          });

          socket.on('messageAll', (msg) => {
            const item = document.createElement('li');
            item.classList.add('all');
            item.style.whiteSpace = 'pre-line';
            item.style.color = 'red';
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          });

          socket.on('messageMe', (msg) => {
            const item = document.createElement('li');
            item.classList.add('me');
            item.style.whiteSpace = 'pre-line';
            item.style.color = 'blue';
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          });
        })
        .catch(error => {
          console.error('Une erreur s\'est produite :', error);
        });
  