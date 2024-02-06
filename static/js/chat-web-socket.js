var urlParams = ofUrl(window.location.href);
console.log(urlParams)
// Создаем новое соединение WebSocket
const token = sessionStorage.getItem('token');

const socket = new WebSocket('ws://' + window.location.host + '/ws?token=' + token + '&other_user_id=' + urlParams.id, [], {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Custom-Header': 'custom_value'
  }
});

// Отправка данных на сервер через WebSocket
function sendDataToServer(data) {
  socket.send(data);
  socket.send(data);
}

function createDivWithText(text) {
  const div = document.createElement('div'); // Создаем новый элемент div
  div.textContent = text; // Устанавливаем текст элемента div равным переданному аргументу
  return div; // Возвращаем созданный элемент div
}

function ofUrl(url) {
  var o = {};
  
  var ms = url.match(/(\w+=[^&]+)/gi);
  if (ms) {
    for(var i=0; i < ms.length; i++) { 
        var v = ms[i].split("=");
        o[v[0]] = v[1];
        console.log(o)
    }
  }
  return o;
}

// Обработчик события открытия соединения
socket.onopen = function(event) {
  console.log('Соединение установлено');
};

// Обработчик события получения сообщения
socket.onmessage = function(event) {
  const receivedData = JSON.parse(event.data);
  console.log('Получены данные: ' + receivedData);

  const newTextDiv = createDivWithText(receivedData.message); // Создаем div с текстом "Привет, мир!"
  chatContainer = document.getElementById('chat-container')
  chatContainer.appendChild(newTextDiv)
};

// Обработчик события закрытия соединения
socket.onclose = function(event) {
  console.log('Соединение закрыто');
};

// Обработчик события ошибки
socket.onerror = function(error) {
  console.error('Произошла ошибка: ' + error.message);
};
document.getElementById('sendButton').addEventListener('click', function() {
  message = document.getElementById('textInput').value
  socket.send(JSON.stringify({ type: 'message', message: message}));
});
