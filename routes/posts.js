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

router.put('/like/id/:_id', authentication, PostController.like)
router.delete('/like/id/:_id', authentication, PostController.removeLike);

module.exports = router