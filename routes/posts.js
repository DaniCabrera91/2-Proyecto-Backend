const express = require('express')
const router = express.Router()
const PostController = require('../controllers/PostController')
const { authentication, isAuthor } = require('../middlewares/authentication')


router.post('/', authentication ,PostController.create)
router.put ('/:_id', authentication, isAuthor,PostController.update)
router.delete ('/:_id', authentication, isAuthor,PostController.delete)


router.get ('/', PostController.getAllPages)
router.get ('/title/:title', PostController.getPostsByTitle)
router.get ('/id/:_id',PostController.getById)
router.put('/likes/:_id', authentication, PostController.like)


module.exports = router