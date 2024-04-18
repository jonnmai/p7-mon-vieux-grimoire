const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res) => {
    Book.find()
      .then((books) => res.status(200).json(books))
      .catch((error) => res.status(400).json({ error }));
  };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json({ book }))
        .catch((error) => res.status(400).json({ error }));
}

exports.createBook = (req, res , next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book ({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.sharpFileName}`,
        ratings: [{
            userId: req.auth._id,
            grade: parseInt(req.body.grade) // Supposons que grade est envoyé dans req.body
        }] 
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch((error) => res.status(400).json({ error }));
}