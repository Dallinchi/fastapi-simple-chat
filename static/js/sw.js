//Устанавливаем обработчик события установки Service Worker
self.addEventListener('install', function(event) {
  console.log('Установлен');
});

// Устанавливаем обработчик события активации Service Worker
self.addEventListener('activate', function(event) {
  console.log('Активирован');
});

// Устанавливаем обработчик события уведомления от клиента
self.addEventListener('message', function(event) {
  console.log('Получено сообщение от клиента:', event.data);
});

// Создаем новое соединение WebSocket
const token = sessionStorage.getItem('token');
const userData = JSON.parse(sessionStorage.getItem('user'));
const socket = new WebSocket('ws://' + self.location.host + '/api/ws?token=' + token, [], {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Custom-Header': 'custom_value'
  }
});

// Обработчик события открытия соединения
socket.onopen = function (event) {
  console.log('Соединение установлено');
};

// Обработчик события получения сообщения
socket.onmessage = function (event) {
  // В примере я пропускаю часть с обработкой входящих сообщений, так как это зависит от вашей логики
  console.log('Получены данные: ' + event.data);
};

// Обработчик события закрытия соединения
socket.onclose = function (event) {
  console.log('Соединение закрыто');
};

// Обработчик события ошибки
socket.onerror = function (error) {
  console.error('Произошла ошибка: ' + error.message);
};
 
