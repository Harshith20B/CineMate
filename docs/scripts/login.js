function login() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    fetch('/login', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            displayUserName(data.user.username);
            window.location.href = '/';
        } else {
            alert(data.error || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function displayUserName(userName) {
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.style.display = 'block';
        userGreeting.innerText = `Welcome, ${userName}`;
    }
}
