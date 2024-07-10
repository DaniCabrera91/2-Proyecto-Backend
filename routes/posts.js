const express = require('express')
const router = express.Router()
const PostController = require('../controllers/PostController')
const { authentication, isAuthor } = require('../middlewares/authentication')


router.post('/', authentication, PostController.create)
router.get('/', PostController.getAll)
router.get('/id/:_id', PostController.getById)
router.get('/title/:title', PostController.getPostByTitle)
router.delete('/:_id', authentication, isAuthor, PostController.delete)
router.put('/:_id', authentication, isAuthor, PostController.update)

module.exports = router