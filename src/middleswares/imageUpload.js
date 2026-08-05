const multer = require("multer");

// const storage = multer.memoryStorage();

// const uploadImage = multer({ storage: storage });

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

module.exports = uploadImage;
