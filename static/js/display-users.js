// Функция для получения пользователей с сервера
async function getUsers() {
    const response = await fetch('/api/users/');
    const users = await response.json();
    return users;
}

// Функция для отображения пользователей
async function displayUsers() {
    const users = await getUsers();

    const usersContainer = document.getElementById('users-container');
    
    users.forEach(user => {
        const userLink = document.createElement('a');
        userLink.textContent = user.username; // Устанавливаем текст элемента div равным переданному аргументу
        // /chat?id={{users[user]['user_id']}}
        userLink.href = "/chat?type=personal&id="+user.id; // Устанавливаем текст элемента div равным переданному аргументу
        usersContainer.appendChild(userLink);
    });
}

// Вызов функции для отображения пользователей
displayUsers();