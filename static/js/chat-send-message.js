document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('textInput').addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    sendMessage();
    event.preventDefault();
  }
});

