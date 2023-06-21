const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: "Invalid username or password."});
  }
  
  if (!isValid(username)) {
    return res.status(404).json({message: "Username already in use."});
  }

  users.push({"username": username, "password": password});
  return res.status(200).json({message: "Register successfull."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   return res.status(200).json(books);
// });
public_users.get('/',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    resolve(books);
  })
  promise.then((books) => {
    return res.status(200).json(books);
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (!isbn) {
      reject("Invalid parameter");
    }
    const book = books[isbn];
    if (!book) {
      reject(`Book with ISBN ${isbn} not found`);
    }
    resolve(book);
  })

  promise
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json({message: error});
    })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const author = req.params.author;
    if (!author) {
      reject("Invalid parameter");
    }

    let books_by_author = {};
    for (isbn in books) {
      if (books[isbn].author === author) {
        books_by_author[isbn] = books[isbn];
      }
    }
    resolve(books_by_author);
  });

  promise
    .then((books) => {
      return res.status(200).json(books);
    })
    .catch((error) => {
      return res.status(404).json({message: error});
    })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const title = req.params.title;
    if (!title) {
      reject("Invalid parameter");
    }

    let books_by_title = {};
    for (isbn in books) {
      if (books[isbn].title === title) {
        books_by_title[isbn] = books[isbn];
      }
    }
    resolve(books_by_title);
  });

  promise
    .then((books) => {
      return res.status(200).json(books);
    })
    .catch((error) => {
      return res.status(404).json({message: error});
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(404).json({message: "Invalid parameter"});
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
