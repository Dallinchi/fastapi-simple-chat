document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем переход по адресу указанному в action
    const formData = new FormData(this);
    fetch('/token', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('token', data.access_token);
    });
});