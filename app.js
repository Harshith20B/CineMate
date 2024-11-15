const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'docs')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
require('dotenv').config();
const db = mysql.createConnection({
    host: 'localhost',
    user: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    database: 'movie_reviews'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (
        err, results) => {
            if (err) {
                console.error('Login error:', err);
                res.status(500).json({ error: 'Login failed' });
            } else if (results.length > 0) {
                const user = results[0];
                req.session.user = { username: user.username, userId: user.UserID };
                res.status(200).json({ message: 'Login successful', user: { username: user.username } });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
    
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, results) => {
        if (err) {
            console.error('Signup error:', err);
            res.status(500).json({ error: 'Signup failed' });
        } else {
            res.status(200).json({ message: 'Signup successful' });
        }
    });
});
    
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            res.status(500).json({ error: 'Logout failed' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});
    
app.get('/check-login-status', (req, res) => {
    if (req.session.user) {
        res.json({ isLoggedIn: true, username: req.session.user.username });
    } else {
        res.json({ isLoggedIn: false });
    }
});
    
app.get('/api/reviews', (req, res) => {
    const { movieId } = req.query;
    const sql = 'SELECT * FROM Reviews WHERE MovieID = ?';
    db.query(sql, [movieId], (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).json({ error: 'Error fetching reviews' });
        } else {
            res.json(results);
        }
    });
});
    
app.post('/api/reviews', (req, res) => {
    const { User_Rating, ReviewContent, MovieID } = req.body;
    const UserID = req.session.user ? req.session.user.userId : null;

    if (!UserID) {
        return res.status(401).json({ error: 'You must be logged in to submit a review' });
    }

    const sql = 'INSERT INTO Reviews (User_Rating, ReviewContent, UserID, MovieID) VALUES (?, ?, ?, ?)';
    db.query(sql, [User_Rating, ReviewContent, UserID, MovieID], (err, result) => {
        if (err) {
            console.error('Error inserting review:', err);
            res.status(500).json({ error: 'Error inserting review' });
        } else {
            console.log('Review inserted successfully');
            res.status(201).json({ message: 'Review inserted successfully' });
        }
    });
});
    
app.get('/api/get-username', (req, res) => {
    const UserName = req.session.user ? req.session.user.username : null;
    if(UserName){
        res.json({UserName})
    }else{
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/api/search', (req, res) => {
    const { title } = req.query;
    const sql = 'SELECT * FROM Movies WHERE Title LIKE ?';
    db.query(sql, [`%${title}%`], (err, results) => {
        if (err) {
            console.error('Error searching movies:', err);
            res.status(500).json({ error: 'Error searching movies' });
        } else {
            res.json(results);
        }
    });
});
app.get('/api/movies', (req, res) => {
    const sql = 'SELECT * FROM Movies';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            res.status(500).json({ error: 'Error fetching movies' });
        } else {
            res.json(results);
        }
    });
});
app.get('/api/tvshows', (req, res) => {
    const sql = 'SELECT * FROM TV_Shows';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tv shows:', err);
            res.status(500).json({ error: 'Error fetching tv shows' });
        } else {
            res.json(results);
        }
    });
});  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
    