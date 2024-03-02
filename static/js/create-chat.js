function openPopup() {
    document.getElementById("popup").style.display = "block";
    fetch('/api/users/')
      .then(response => response.json())
      .then(data => {
        const userList = document.getElementById("userList");
        userList.innerHTML = '';
        data.forEach(user => {
          const option = document.createElement("option");
          option.value = user.id;
          option.text = user.username;
          userList.appendChild(option);
        });
      });
  }
  
  function sendChatRequest() {
    const chatName = document.getElementById("chatName").value;
    const userList = document.getElementById("userList");
    const selectedUsers = [...userList.selectedOptions].map(option => option.value);
    const requestData = {
      users_id: selectedUsers,
      chat: {title: chatName}
    };
    fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer' + sessionStorage.getItem('token')
        },
        body: JSON.stringify(requestData)})
        .then(response => {
          if (response.ok) {
            document.getElementById("popup").style.display = "none";
            window.location.reload();
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
    // Здесь можно отправить запрос на сервер с данными requestData
    console.log("Chat Name:", chatName);
    console.log("Selected Users:", selectedUsers);
  }
  