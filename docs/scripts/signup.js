function signup() {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);

    fetch('/signup', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Signup failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
