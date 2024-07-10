const express = require('express')
const router = express.Router()
const CommentController = require('../controllers/CommentController')
const { authentication, isAuthor } = require('../middlewares/authentication')


router.post('/', authentication, CommentController.create)
router.get('/', CommentController.getAll)
router.get('/id/:_id', CommentController.getById)
router.get('/title/:title', CommentController.getCommentByTitle)
router.delete('/:_id', authentication, isAuthor, CommentController.delete)
router.put('/:_id', authentication, isAuthor, CommentController.update)



module.exports = router