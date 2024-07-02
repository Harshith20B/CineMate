document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    document.getElementById('logout').addEventListener('click', logout);
});

function login() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('/login', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Login successful');
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function signup() {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('/signup', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Signup successful');
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Logout successful');
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function checkLoginStatus() {
    fetch('/api/checkLoginStatus', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('usernameDisplay').style.display = 'block';
            document.getElementById('username').textContent = data.username;
            document.getElementById('logout').style.display = 'block';
        } else {
            document.getElementById('usernameDisplay').style.display = 'none';
            document.getElementById('logout').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function searchMovies() {
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch(`/api/search?${params.toString()}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Clear previous results

    if (results.length > 0) {
        results.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.className = 'movie';

            // Create left and right containers
            const leftContainer = document.createElement('div');
            leftContainer.className = 'left-container';
            leftContainer.innerHTML = `
                <h3>${movie.Title}</h3>
                <p><strong>Release Date:</strong> ${movie.Release_Date}</p>
                <p><strong>Rating:</strong> ${movie.Movie_Rating}</p>
                <p><strong>OTT Platform:</strong> ${movie.OTT_Platform}</p>
                <p><strong>Description:</strong> ${movie.Description}</p>
            `;

            const rightContainer = document.createElement('div');
            rightContainer.className = 'right-container';

            // Fetch and display existing reviews
            fetch(`/api/reviews?movieId=${movie.MovieID}`)
                .then(response => response.json())
                .then(reviews => {
                    const reviewsSection = document.createElement('section');
                    reviewsSection.className = 'user-reviews';
                    reviewsSection.innerHTML = '<h4>User Reviews</h4>';

                    if (reviews.length > 0) {
                        reviews.forEach((review, index) => {
                            const reviewDiv = document.createElement('div');
                            reviewDiv.className = 'review';
                            reviewDiv.innerHTML = `
                                <p><strong>Review ${index + 1}:</strong></p>
                                <p><strong>Rating:</strong> ${review.User_Rating}</p>
                                <p><strong>Review:</strong> ${review.ReviewContent}</p>
                            `;
                            reviewsSection.appendChild(reviewDiv);
                        });
                    } else {
                        reviewsSection.innerHTML += '<p>No reviews yet.</p>';
                    }

                    // Add form to submit a new review
                    const reviewForm = document.createElement('form');
                    reviewForm.className = 'reviewForm';
                    reviewForm.innerHTML = `
                        <label for="User_Rating">Rating (out of 5):</label>
                        <input type="number" name="User_Rating" min="1" max="5" required>
                        <br>
                        <label for="ReviewContent">Review:</label>
                        <textarea name="ReviewContent" rows="4" required></textarea>
                        <br>
                        <input type="hidden" name="MovieID" value="${movie.MovieID}">
                        <button type="button" onclick="submitReview(this)">Submit Review</button>
                    `;
                    reviewsSection.appendChild(reviewForm);
                    rightContainer.appendChild(reviewsSection);
                })
                .catch(error => {
                    console.error('Error fetching reviews:', error);
                });

            // Append left and right containers to the movieDiv
            movieDiv.appendChild(leftContainer);
            movieDiv.appendChild(rightContainer);
            searchResults.appendChild(movieDiv);
        });
    } else {
        searchResults.innerHTML = '<p>No movies found.</p>';
    }
}

function submitReview(button) {
    const form = button.closest('.reviewForm');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('/api/reviews', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Review submitted successfully');
            // Reload reviews after submitting a new one
            searchMovies();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
