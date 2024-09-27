const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { authentication, isAuthor } = require('../middlewares/authentication');
const upload = require('../middlewares/multerConfig');

router.post('/', authentication, upload.single('image'), PostController.create);
router.put('/:_id', authentication, isAuthor, upload.single('image'), PostController.update);
router.delete('/:_id', authentication, isAuthor, PostController.delete);
router.get('/', PostController.getAll);
router.get('/pages', PostController.getAllPages);
router.get('/id/:_id', PostController.getById);
router.get('/user/:userId', authentication, PostController.getPostsByUser);
router.put('/like/id/:_id', authentication, PostController.like); // Método para dar o quitar like

module.exports = router;
