const express = require('express')
const router = express.Router()
const CommentController = require('../controllers/CommentController')
const { authentication, isAuthor } = require('../middlewares/authentication')


router.post('/id/:id', authentication, CommentController.create)
// router.get('/', CommentController.getAll)
// router.get('/id/:id', CommentController.getById)
// router.delete('/:id', authentication, isAuthor, CommentController.delete)
// router.put('/:id', authentication, isAuthor, CommentController.update)
router.put('/like/id/:_id', authentication, CommentController.like)
router.delete('/like/id/:_id', authentication, CommentController.removeLike)



module.exports = router