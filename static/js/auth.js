document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем переход по адресу указанному в action
    const formData = new FormData(this);
    fetch('/api/token', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка авторизации. Пожалуйста, проверьте введенные данные.');
        }
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem('token', data.access_token);
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
            window.location.href = '/users/';
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    })
    .catch(error => {
        console.error('Ошибка:', error.message); // Выводим ошибку
        alert(error.message); // Выводим ошибку с помощью alert
    });
});
