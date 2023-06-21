const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.filter((user) => {
    return user.username === username
  }).length == 0;
}

const authenticatedUser = (username, password) => {
  return users.filter((user) => {
    return user.username === username && user.password === password;
  }).length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Invalid username or password." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({message: "Login successfull."});
  } else {
    return res.status(208).json({message: "Wrong credentials."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(404).json({ message: "Invalid ISBN." });
  }
  const review = req.query.review;
  if (!review) {
    return res.status(404).json({ message: "Invalid review." });
  }
  const user = req.session.authorization.username;
  if (!user) {
    return res.status(403).json({message: "Not authenticated."});
  }

  if(books[isbn]) {
    books[isbn].reviews[user] = review;
  }
  return res.status(200).json({message: "Review added."});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(404).json({ message: "Invalid ISBN." });
  }
  const user = req.session.authorization.username;
  if (!user) {
    return res.status(403).json({message: "Not authenticated."});
  }

  if(books[isbn]) {
    delete books[isbn].reviews[user];
  }
  return res.status(200).json({message: "Review deleted."});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
