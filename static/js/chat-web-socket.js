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
  const newTextDiv = createDivWithText(receivedData.reciver_username + ": " +receivedData.message); // Создаем div с текстом полученым из ответа
  console.log('Получены данные: ' + receivedData);

  if (receivedData.sender_id == receivedData.reciver_id & receivedData.reciver_id == urlParams.id) {
    appendMessage(newTextDiv)
  } else {
    if ((receivedData.sender_id == urlParams.id) || (receivedData.reciver_id == urlParams.id && userData.id != urlParams.id)) {
      appendMessage(newTextDiv)
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
  const data = {
    token: token,
    reciver_user_id: urlParams.id,
    reciver_username: userData.username,
    message: message,
  };

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

document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('textInput').addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    sendMessage();
    event.preventDefault();
  }
});
