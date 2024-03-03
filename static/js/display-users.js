// Функция для получения пользователей с сервера
async function getUsers() {
    const response = await fetch('/api/users/');
    const users = await response.json();
    return users;
}

// Функция для получения групп
function getChats() {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    return userData.chats;
}

// Функция для отображения пользователей
async function displayUsers() {
    const users = await getUsers();

    const usersContainer = document.getElementById('users-container');
    
    users.forEach(user => {
        const userLink = document.createElement('a');
        userLink.textContent = user.username; // Устанавливаем текст элемента div равным переданному аргументу
        userLink.href = "/chat?type=personal&id=" + user.id; // Устанавливаем текст элемента div равным переданному аргументу
        usersContainer.appendChild(userLink);
    });
    
    const chats = await getChats();

    const chatsContainer = document.getElementById('chats-container');
    
    chats.forEach(chat => {
        const chatLink = document.createElement('a');
        chatLink.textContent = chat.title; // Устанавливаем текст элемента div равным переданному аргументу
        chatLink.href = "/chat?type=group&id=" + chat.id; // Устанавливаем текст элемента div равным переданному аргументу
        chatsContainer.appendChild(chatLink);
    });
}

// Вызов функции для отображения пользователей
displayUsers();