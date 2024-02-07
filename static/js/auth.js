document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем переход по адресу указанному в action
    const formData = new FormData(this);
    fetch('/api/token', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
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
            window.location.href = '/users/'; 
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
   

});