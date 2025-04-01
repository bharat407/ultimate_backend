const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // Fix UUID import
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    if (!file) {
      return cb(new Error("File not provided"), null);
    }
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
