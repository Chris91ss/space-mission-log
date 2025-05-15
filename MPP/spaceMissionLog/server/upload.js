// Install multer with: npm install multer
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' }); // Files will be stored in the uploads folder

// In your app.js or a new route file (e.g., server/routes/uploadRoutes.js)
const uploadRouter = require('express').Router();

uploadRouter.post('/api/upload', upload.single('file'), (req, res) => {
  // req.file holds the file details
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

module.exports = uploadRouter;