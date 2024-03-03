function openPopup() {
    document.getElementById("popup").style.display = "block";
    fetch('/api/users/')
    .then(response => response.json())
    .then(data => {
      const userList = document.getElementById("userList");
      userList.innerHTML = '';
      data.forEach(user => {
        if (user.id != userData.id) {
          const option = document.createElement("option");
          option.value = user.id;
          option.text = user.username;
          console.log(user.id == userData.id);
          userList.appendChild(option);
        }
      });
    });
}

function sendChatRequest() {
  const chatName = document.getElementById("chatName").value;
  const userList = document.getElementById("userList");
  const selectedUsers = [...userList.selectedOptions].map(option => option.value);
  selectedUsers.push(userData.id);
  const requestData = {
    title: chatName,
    users_id: selectedUsers
  };
  fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify(requestData)})
      .then(response => {
        if (response.ok) {
          document.getElementById("popup").style.display = "none";
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
              console.log(data)
          })
          .catch(error => {
              console.error('There has been a problem with your fetch operation:', error);
          });
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        const chatsContainer = document.getElementById('chats-container');
        const chatLink = document.createElement('a');
        chatLink.textContent = data.title; // Устанавливаем текст элемента div равным переданному аргументу
        chatLink.href = "/chat?type=group&id=" + data.id; // Устанавливаем текст элемента div равным переданному аргументу
        chatsContainer.appendChild(chatLink);

        console.log(data);
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  // Здесь можно отправить запрос на сервер с данными requestData
  console.log("Chat Name:", chatName);
  console.log("Selected Users:", selectedUsers);
}
