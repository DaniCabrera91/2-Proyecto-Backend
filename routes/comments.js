const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authentication, isCommentAuthor } = require('../middlewares/authentication');

router.post('/post/:_id', authentication, CommentController.create);

router.get('/post/recent/:postId', CommentController.getRecentCommentsByPost);

router.get('/post/:postId', CommentController.getCommentsByPost);

router.get('/count/:postId', CommentController.getCommentsCountByPost);

router.put('/id/:_id', authentication, isCommentAuthor, CommentController.updateComment);

router.delete('/id/:_id', authentication, isCommentAuthor, CommentController.deleteComment);

router.put('/like/id/:_id', authentication, CommentController.like);

router.put('/unlike/id/:_id', authentication, CommentController.unlike);


module.exports = router;
