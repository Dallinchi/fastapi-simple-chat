var urlParams = ofUrl(window.location.href);

// Создаем новое соединение WebSocket
const token = sessionStorage.getItem('token');
const userData = JSON.parse(sessionStorage.getItem('user'));
console.log(" User Data -> " + userData);
console.log(" User username -> " + userData.username);
console.log(" User id -> " + userData);
const socket = new WebSocket('wss://' + window.location.host + '/api/ws?token=' + token, [], {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Custom-Header': 'custom_value'
  }
});

function createDivWithText(text) {
  const div = document.createElement('div'); // Создаем новый элемент div
  div.textContent = text; // Устанавливаем текст элемента div равным переданному аргументу
  return div; // Возвращаем созданный элемент div
}

function ofUrl(url) {
  var o = {};

  var ms = url.match(/(\w+=[^&]+)/gi);
  if (ms) {
    for (var i = 0; i < ms.length; i++) {
      var v = ms[i].split("=");
      o[v[0]] = v[1];
    }
  }
  return o;
}
function getUsernameByUserId(id) {
  jsonData = fetch('api/users/').json();
  for (const user of jsonData) {
    if (user.id === id) {
      return user.username;
    }
  }
  return null; // Если пользователь с таким айди не найден
}
function getTitleIdByChatId(id) {
  jsonData = fetch('api/chats/').json();
  for (const chat of jsonData) {
    if (chat.title === usernaidme) {
      return chat.title;
    }
  }
  return null; // Если чат с таким айди не найден
}

// Обработчик события открытия соединения
socket.onopen = function (event) {
  console.log('Соединение установлено');
};

function appendMessage(newTextDiv) {
  chatContainer = document.getElementById('chatContainer')
  if (chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 1) {
    chatContainer.appendChild(newTextDiv)
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    chatContainer.appendChild(newTextDiv)
  }
}

// Обработчик события получения сообщения
socket.onmessage = function (event) {
  const receivedData = JSON.parse(event.data);

  if (receivedData.type == "personal-message") {
    console.log('Получено личное сообщение');

    const sender_id = receivedData.sender_id;
    const sender_username = getUsernameByUserId(sender_id);
    const message = receivedData.message;

    const newText = sender_username + ": " + message;
    const newTextDiv = createDivWithText(newText); // Создаем div с текстом полученым из ответа
    const newNotification = newText;

    if (sender_id == urlParams.id) {
      appendMessage(newTextDiv)
    } else {
      showPopup(newNotification, 1000)
    }
  } else if (receivedData.type == "group-message") {
    console.log('Получено групповое сообщение');

    const sender_id = receivedData.sender_id;
    const sender_username = getUsernameByUserId(sender_id);
    const chat_id = receivedData.chat_id;
    const chat_title = getTitleIdByChatId(chat_id);
    const message = receivedData.message;

    const newText = `${sender_username}: ${message}`;
    const newTextDiv = createDivWithText(newText); // Создаем div с текстом полученым из ответа
    const newNotification = `${chat_title}(${sender_username}): ${message}`;

    if (urlParams.type == "chat" && chat_id == urlParams.id) {
      appendMessage(newTextDiv)
    } else {
      showPopup(newNotification, 1000)
    }
  }
};

// Обработчик события закрытия соединения
socket.onclose = function (event) {
  console.log('Соединение закрыто');
};

// Обработчик события ошибки
socket.onerror = function (error) {
  console.error('Произошла ошибка: ' + error.message);
};

// Обработчик отправления сообщения(button or 'Enter')
function sendMessage() {
  const message = document.getElementById('textInput').value;

  var data;

  if (urlParams.type == "group") {
    data = {
      type: "group-message",
      token: token,
      sender_id: userData.id,
      chat_id: urlParams.id,
      message: message,
    };
  } else {
    data = {
      type: "personal-message",
      token: token,
      sender_id: userData.id,
      reciver_id: urlParams.id,
      message: message,
    };
  }

  fetch('/api/send-message/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        document.getElementById('textInput').value = "";
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}