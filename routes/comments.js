const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authentication, isAuthor } = require('../middlewares/authentication');

router.post('/post/:_id', authentication, CommentController.create);
router.get('/post/recent/:postId', CommentController.getRecentCommentsByPost); // Obtener comentarios recientes
router.get('/post/:postId', CommentController.getCommentsByPost); // Obtener todos los comentarios
router.get('/count/:postId', CommentController.getCommentsCountByPost); // Nueva ruta para contar comentarios
router.delete('/id/:_id', authentication, isAuthor, CommentController.deleteComment);
router.put('/like/id/:_id', authentication, CommentController.like); // Maneja like/unlike

module.exports = router;
