const express = require('express')
const router = express.Router()
const PostController = require('../controllers/PostController')
const { authentication, isAuthor } = require('../middlewares/authentication')


router.post('/', authentication ,PostController.create)
router.put ('/:_id', authentication,PostController.update)
router.delete ('/:_id', authentication,PostController.delete)


router.get ('/', PostController.getAllPages)
router.get ('/name/:name', PostController.getPostsByName)
router.get ('/id/:_id',PostController.getById)
router.put('/likes/:_id', authentication, PostController.like)


module.exports = router