const multer = require("multer");


const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

module.exports = uploadImage;
