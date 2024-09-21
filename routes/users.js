const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authentication } = require('../middlewares/authentication');
const upload = require('../middlewares/multerConfig');

router.post('/', upload.single('profileImage'), UserController.register);
router.put('/id/:_id', authentication, upload.single('profileImage'), UserController.updateUser);
router.post('/login', UserController.login);
router.delete('/logout', authentication, UserController.logout);
router.get('/', UserController.getAll);
router.get('/loggedUser', authentication, UserController.getLoggedUser);
router.get('/:name', UserController.getByName);
router.get('/id/:_id', UserController.getById);
router.put('/follow/:id', authentication, UserController.follow);
router.put('/unfollow/:id', authentication, UserController.unfollow);

module.exports = router;
