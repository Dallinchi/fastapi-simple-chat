// Функция для получения пользователей с сервера
async function getUsers() {
  const response = await fetch('/api/users/');
  const users = await response.json();
  return users;
}

function createHead() {
  var head = document.createElement('h1');
  const id = urlParams.id;
  if (urlParams.type == 'personal') {
    fetch(`/api/users/${id}`)
    .then(response => {
      if (response.ok)
        return response.json();
      return new Error('Network response was not ok');
    })
    .then(data => {
      head.textContent = data.username;
    })
    .then(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
  }
  else {
    const chats = JSON.parse(sessionStorage.getItem('user')).chats;
    chats.forEach(chat => {
      if (chat.id == id) {
        var usernames = chat.owners.map(function(user) {
          return user.username;
        });
        head.textContent = `${chat.title}(${usernames.join(', ')})`;
      }
    });
  }
  document.getElementById('chatHead').appendChild(head);
}

var offset = 0;
var last_message_id = 0;
var start_message_id = 0;
const pullMess = (skip = 0, limit = 40) => {
  const chatContainer = document.getElementById('chatContainer');
  var scrollTopBefore = chatContainer.scrollTop;

  const chats = JSON.parse(sessionStorage.getItem('user')).chats;
  var owners;
  chats.forEach(chat => {
    if (chat.id == urlParams.id) {
      owners = chat.owners;
    }
  });

  fetch(`/api/messages/${urlParams.id}?skip=${skip}&limit=${limit}`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .then(data => {
    data.forEach(mess => {
      var username;
      owners.forEach(user => {
        if (user.id == mess.user_id)
          username = user.username;
      });

      const newText = `${username}: ${mess.message}`;
      const newTextDiv = createDivWithText(newText);
      chatContainer.insertAdjacentElement('afterbegin', newTextDiv);

      if (mess.id > last_message_id)
        last_message_id = mess.id;

      scrollTopBefore += newTextDiv.offsetHeight;
    });
    chatContainer.scrollTop = scrollTopBefore;
    if (data.length == 0)
      offset = -1;
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

document.getElementById('chatContainer').addEventListener('scroll', function() {
  chatContainer = document.getElementById('chatContainer')
  if (chatContainer.scrollTop == 0 && offset >= 0) {
    offset += 40;
    console.log(offset, last_message_id, start_message_id);
    pullMess(offset + last_message_id - start_message_id);
  }
});

document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('textInput').addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    sendMessage();
    event.preventDefault();
  }
});

function begin() {
  createHead();
  pullMess();
  setTimeout(scrollDown, 400);
  fetch(`/api/messages/${urlParams.id}?skip=0&limit=1`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  })
  .then(response => {
    if (response.ok)
      return response.json();
      throw new Error('Network response was not ok.');
  })
  .then(mess => {
    start_message_id = mess[0].id;
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}
begin();