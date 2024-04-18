const express = require('express');
const router = express.Router();

const authorization = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const sharp = require('../middlewares/sharp')

const bookCtrl = require('../controllers/book.controller');

router.get('/books', bookCtrl.getAllBooks);
router.get('/books/:id', bookCtrl.getOneBook);
// router.get('/books/bestrating', bookCtrl.getBooksRating)
router.post('/books', authorization, multer, sharp, bookCtrl.createBook);

module.exports = router;