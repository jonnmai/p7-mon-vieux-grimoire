const express = require("express");
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require("mongoose");
require('dotenv').config();

const userRoutes = require('./routes/user.routes');
const bookRoutes = require('./routes/book.routes');

mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true,
      useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée"));

const app = express();

//Middlewares
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);
app.use('/api', bookRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
