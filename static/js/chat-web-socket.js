var urlParams = ofUrl(window.location.href);

// Создаем новое соединение WebSocket
const token = sessionStorage.getItem('token');
var userData = JSON.parse(sessionStorage.getItem('user'));
const socket = new WebSocket('wss://' + window.location.host + '/api/ws?token=' + token, [], {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Custom-Header': 'custom_value'
  }
});
fetch('/api/users/me', {
  method: 'GET',
  headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
  },
})
.then(response => response.json())
.then(data => {
  sessionStorage.setItem('user', JSON.stringify(data)); // Сохраняем объект data как строку
  userData = data;
})
.catch(error => {
  console.error('There has been a problem with your fetch operation:', error);
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

function getTitleByChatId(chatId) {
  const chat = userData.chats.find(chat => chat.id === chatId);
  return chat ? chat.title : null;
}

// Обработчик события открытия соединения
socket.onopen = function (event) {
  console.log('Соединение установлено');
};

function scrollDown() {
  chatContainer = document.getElementById('chatContainer')
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
function appendMessage(newTextDiv, message_id) {
  last_message_id = message_id;
  chatContainer = document.getElementById('chatContainer')
  if (chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 1) {
    chatContainer.appendChild(newTextDiv)
    scrollDown();
  } else {
    chatContainer.appendChild(newTextDiv)
  }
}

// Обработчик события получения сообщения
socket.onmessage = async function (event) {
  const receivedData = JSON.parse(event.data);

  if (receivedData.message_type == "personal-message") {
    console.log('Получено личное сообщение');

    const sender_id = receivedData.sender_id;
    const sender_username = receivedData.sender_username;
    const message = receivedData.message;

    const newText = sender_username + ": " + message;
    const newTextDiv = createDivWithText(newText); // Создаем div с текстом полученым из ответа
    const newNotification = newText;

    if (sender_id == urlParams.id || sender_id == userData.id) {
      appendMessage(newTextDiv)
    } else {
      showPopup(newNotification, 1000)
    }
  } else if (receivedData.message_type == "group-message") {
    console.log('Получено групповое сообщение');

    //const sender_id = receivedData.sender_id;
    const sender_username = receivedData.sender_username;
    const chat_id = receivedData.chat_id;
    const chat_title = getTitleByChatId(chat_id);
    const message = receivedData.message;
    const message_id = receivedData.message_id;

    const newText = `${sender_username}: ${message}`;
    const newTextDiv = createDivWithText(newText); // Создаем div с текстом полученым из ответа
    const newNotification = `${chat_title}(${sender_username}): ${message}`;

    if (urlParams.type == "group" && chat_id == urlParams.id) {
      appendMessage(newTextDiv, message_id)
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
      message_type: "group-message",
      token: token,
      sender_id: userData.id,
      chat_id: urlParams.id,
      message: message,
    };
  } else {
    data = {
      message_type: "personal-message",
      token: token,
      sender_id: userData.id,
      receiver_id: urlParams.id,
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
