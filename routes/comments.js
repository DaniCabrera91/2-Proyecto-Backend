const express = require('express')
const router = express.Router()
const CommentController = require('../controllers/CommentController')
const { authentication } = require('../middlewares/authentication')


router.post('/post_id/:_id', authentication, CommentController.create)
router.get('/', CommentController.getAll)
router.delete('/id/:_id', authentication, CommentController.deleteComment)
router.put('/id/:id', authentication, CommentController.updateComment)
router.put('/like/id/:_id', authentication, CommentController.like)
router.put('/removeLike/id/:_id', authentication, CommentController.removeLike)



module.exports = router