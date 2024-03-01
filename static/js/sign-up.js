document.getElementById('sign-upForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем переход по адресу указанному в action
    const formData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }
    fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка регистрации. Пожалуйста, проверьте введенные данные.');
        }
        return response.json();
    })
    .then(data => {
        window.location.replace('/');
    })
    .catch(error => {
        console.error('Ошибка:', error.message); // Выводим ошибку
        alert(error.message); // Выводим ошибку с помощью alert
    });
});
