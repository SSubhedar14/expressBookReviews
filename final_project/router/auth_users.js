const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const public_users = express.Router();

// Assuming you have a `books` object or array where each book has an `isbn` property
// Example: const books = { "978-3-16-148410-0": { title: "Book Title", author: "Author Name" }, ... };

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters
    const book = books[isbn]; // Find book based on ISBN in your data source

    if (book) {
        res.status(200).json(book); // Send book details as JSON response
    } else {
        res.status(404).json({ message: "Book not found" }); // Error if ISBN doesn't match any book
    }
});

const isValid = (username)=>{ 
  //returns boolean
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
}

const authenticatedUser = (username,password)=>{ 
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

//  Task 7
//  Only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({data:password}, "access", {expiresIn: 3600});
    req.session.authorization = {accessToken,username};
    return res.status(200).send("User successfully logged in");
  }
  else {
    return res.status(208).json({message: "Invalid username or password"});
  }
});

//  Task 8
//  Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).send("Review successfully posted");
  }
  else {
      return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

//  Task 9
//  Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted");
  }
  else {
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;