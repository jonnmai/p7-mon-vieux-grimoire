const multer = require("multer");

//Multer store files in "req.file"

const storage = multer.memoryStorage();
module.exports = multer({ storage: storage }).single("image");