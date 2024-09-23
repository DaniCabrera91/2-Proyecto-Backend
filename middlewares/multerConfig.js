const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinaryConfig')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_uploads', 
    allowedFormats: ['jpeg', 'png', 'jpg'], 
  },
})

const upload = multer({
  storage: storage,
})

module.exports = upload
