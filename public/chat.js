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
    socket.emit('pseudo', receiver);
  });

  return link;
}


function clearMessages() {
  const allElements = document.querySelectorAll('li.all');
  allElements.forEach(element => element.remove());

  const meElements = document.querySelectorAll('li.me');
  meElements.forEach(element => element.remove());

  document.getElementById('isWritting').textContent = '';
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
      messages.appendChild(item);

      const textParts = msg.split('\n');
      if (textParts.length === 1) {

        const entireText = document.createElement('span');
        entireText.classList.add('after-newline');
        entireText.textContent = msg;
        item.appendChild(entireText);
      } else {
        const firstPart = document.createElement('span');
        firstPart.classList.add('before-newline');
        firstPart.textContent = textParts[0];

        const secondPart = document.createElement('span');
        secondPart.classList.add('after-newline');
        secondPart.textContent = textParts.slice(1).join('\n');

        item.appendChild(firstPart);
        item.appendChild(secondPart);
      }
      window.scrollTo(0, document.body.scrollHeight);
      const container = document.querySelector(".chat .ul-container");
      container.scrollTop = container.scrollHeight;

    });

    socket.on('messageMe', (msg) => {

      const item = document.createElement('li');
      item.classList.add('me');
      messages.appendChild(item);

      const textParts = msg.split('\n');
      if (textParts.length === 1) {

        const entireText = document.createElement('span');
        entireText.classList.add('after-newline');
        entireText.textContent = msg;
        item.appendChild(entireText);
      } else {
        const firstPart = document.createElement('span');
        firstPart.classList.add('before-newline');
        firstPart.textContent = textParts[0];

        const secondPart = document.createElement('span');
        secondPart.classList.add('after-newline');
        secondPart.textContent = textParts.slice(1).join('\n');

        item.appendChild(firstPart);
        item.appendChild(secondPart);
      }
      window.scrollTo(0, document.body.scrollHeight);

      const container = document.querySelector(".chat .ul-container");
      container.scrollTop = container.scrollHeight;
    });
  })
  .catch(error => {
    console.error('Une erreur s\'est produite :', error);
  });
