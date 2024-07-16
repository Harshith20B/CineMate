document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    document.getElementById('logout').addEventListener('click', (event) => {
        event.preventDefault();
        logout();
    });
});

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

function checkLoginStatus() {
    fetch('/check-login-status', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('signup').style.display = 'none';
            document.getElementById('logout').style.display = 'inline';
            document.getElementById('usernameDisplay').style.display = 'inline';
            fetch('/api/get-username', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(userData => {
                document.getElementById('username').textContent = userData.username;
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
        } else {
            document.getElementById('login').style.display = 'inline';
            document.getElementById('signup').style.display = 'inline';
            document.getElementById('logout').style.display = 'none';
            document.getElementById('usernameDisplay').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
    });
}

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
            checkLoginStatus();
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

function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            checkLoginStatus();
            window.location.href = '/';
        } else {
            alert(data.error || 'Logout failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
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

            // Display movie details on the left
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'left-container';
            detailsDiv.innerHTML = `
                <h3>${movie.Title}</h3>
                <p><strong>Release Date:</strong> ${movie.Release_Date}</p>
                <p><strong>Rating:</strong> ${movie.Movie_Rating}</p>
                <p><strong>OTT Platform:</strong> ${movie.OTT_Platform}</p>
                <p><strong>Description:</strong> ${movie.Description}</p>
            `;

            // Display user reviews on the right
            const reviewsDiv = document.createElement('div');
            reviewsDiv.className = 'right-container user-reviews';
            fetch(`/api/reviews?movieId=${movie.MovieID}`)
                .then(response => response.json())
                .then(reviews => {
                    if (reviews.length > 0) {
                        reviews.forEach((review, index) => {
                            const reviewDiv = document.createElement('div');
                            reviewDiv.className = 'review';
                            reviewDiv.innerHTML = `
                                <p><strong>Review ${index + 1}:</strong></p>
                                <p><strong>Rating:</strong> ${review.User_Rating}</p>
                                <p>${review.ReviewContent}</p>
                            `;
                            reviewsDiv.appendChild(reviewDiv);
                        });
                    } else {
                        reviewsDiv.innerHTML = '<p>No reviews yet.</p>';
                    }

                    // Add review form
                    const reviewForm = document.createElement('form');
                    reviewForm.className = 'reviewForm';
                    reviewForm.innerHTML = `
                        <h4>Submit Your Review</h4>
                        <label for="User_Rating">Rating (out of 5):</label>
                        <input type="number" name="User_Rating" min="1" max="5" required>
                        <br>
                        <label for="ReviewContent">Review:</label>
                        <textarea name="ReviewContent" rows="2" required></textarea>
                        <br>
                        <input type="hidden" name="MovieID" value="${movie.MovieID}">
                        <button type="button" onclick="submitReview(this)">Submit Review</button>
                    `;

                    reviewsDiv.appendChild(reviewForm);
                })
                .catch(error => {
                    console.error('Error fetching reviews:', error);
                    reviewsDiv.innerHTML = '<p>Error fetching reviews</p>';
                });

            movieDiv.appendChild(detailsDiv);
            movieDiv.appendChild(reviewsDiv);
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
        if (data.message) {
            alert(data.message);
            form.reset();
            // Reload search results after successful submission
            searchMovies();
        } else {
            alert(data.error || 'Review submission failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function fetchAllMovies() {
    fetch('/api/movies', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const moviesList = document.getElementById('moviesList');
        moviesList.innerHTML = '';

        if (data.length > 0) {
            data.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.className = 'movie';

                movieDiv.innerHTML = `
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-description">${movie.Description}</p>
                    <p class="movie-details"><strong>Rating:</strong> ${movie.Movie_Rating}</p>
                    <p class="movie-details"><strong>Release Date:</strong> ${movie.Release_Date}</p>
                    <p class="movie-details"><strong>OTT Platform:</strong> ${movie.OTT_Platform}</p>
                `;

                moviesList.appendChild(movieDiv);
            });
        } else {
            moviesList.innerHTML = '<p>No movies found.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching movies:', error);
        alert('An error occurred. Please try again.');
    });
}
