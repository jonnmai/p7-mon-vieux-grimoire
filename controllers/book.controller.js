const { error } = require('console');
const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');


exports.getAllBooks = (req, res) => {
    Book.find()
      .then((books) => res.status(200).json(books))
      .catch((error) => res.status(400).json({ error }));
  };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json( book ))
        .catch((error) => res.status(400).json({ error }));
}

exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })  // Filter rating decrease
        .limit(3)  
        .then(topBooks => {
            res.status(200).json(topBooks);  // Return 3 best books
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.createBook = (req, res , next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book ({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.sharpFileName}`,

    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not Authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));    
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};



exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.sharpFileName}`
    } : 
    {
        ...req.body
    };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }

            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }

            if (req.file && book.imageUrl) {
                // Si une nouvelle image est téléchargée et qu'une image existante est associée au livre, supprimez l'ancienne image
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (error) => {
                    if (error) {
                        console.error('Erreur lors de la suppression de l\'image :', error);
                        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image existante' });
                    }
                    
                    // Mettre à jour le livre avec le nouveau contenu
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                        .then(() => {
                            res.status(200).json({ message: 'Objet modifié avec succès !' });
                        })
                        .catch((error) => {
                            res.status(500).json({ error: 'Erreur lors de la mise à jour du livre' });
                        });
                });
            } else {
                // Aucune nouvelle image téléchargée, simplement mettre à jour le livre sans supprimer l'image existante
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Objet modifié avec succès !' });
                    })
                    .catch((error) => {
                        res.status(500).json({ error: 'Erreur lors de la mise à jour du livre' });
                    });
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.postRating = (req, res, next) => {
    const rating = req.body.rating;
    const userId = req.auth.userId;
    const rateObject = { userId, grade: rating };

    // Verify rated or not 
    Book.findOne({ _id: req.params.id, "ratings.userId": userId })  //Need "" because in Js ' . ' is used to access objects properties but also in MongoDB for nested fields
        .then(ratedBook => {
            if (ratedBook) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            }

            // Ajouter la nouvelle note
            Book.findByIdAndUpdate(
                req.params.id,
                { $push: { ratings: rateObject } },
                { new: true } // return updated doc
            )
            .then(updatedBook => {
                if (!updatedBook) {
                    return res.status(404).json({ message: 'Livre non trouvé' });
                }

                // Maps on ratings[] to return the ratings in the ratingsArray array
                const ratingsArray = updatedBook.ratings.map(rating => parseInt(rating.grade));
                // console.log(ratingsArray);
                const totalRatings = ratingsArray.reduce((acc, iteration) => acc + iteration, 0);  //pass on every array element and add it to the accumulator
                const averageRating = totalRatings / updatedBook.ratings.length;
                Math.round(averageRating);

                updatedBook.averageRating = averageRating;

                updatedBook.save()
                    .then(() => {
                        res.status(200).json(updatedBook);
                    })
                    .catch(error => {
                        res.status(500).json({ error: 'Erreur lors de la mise à jour de la moyenne des notes' });
                    });
            })
            .catch(error => {
                res.status(500).json({ error: 'Erreur lors de l\'ajout de la note' });
            });
        })
        .catch(error => {
            res.status(500).json({ error: 'Erreur lors de la vérification de la note précédente' });
        });
};