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

document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('textInput').addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    sendMessage();
    event.preventDefault();
  }
});