const express = require('express');
const router = express.Router();

const authentification = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const sharp = require('../middlewares/sharp')

const bookCtrl = require('../controllers/book.controller');

router.get('/books/bestrating', bookCtrl.getBestRating);
router.get('/books', bookCtrl.getAllBooks);
router.get('/books/:id', bookCtrl.getOneBook);



router.post('/books', authentification, multer, sharp, bookCtrl.createBook);
router.post('/books/:id/rating', authentification, bookCtrl.postRating);

router.delete('/books/:id', authentification, bookCtrl.deleteBook);

router.put('/books/:id', authentification, multer, sharp, bookCtrl.modifyBook);

module.exports = router;