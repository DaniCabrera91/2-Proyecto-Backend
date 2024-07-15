const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { authentication } = require('../middlewares/authentication')

router.post('/', UserController.register)
router.put('/id/:_id', authentication, UserController.updateUser)
router.post('/login', UserController.login)
router.delete('/logout', authentication, UserController.logout)

router.get('/', UserController.getAll)
router.get('/loggedUser', authentication, UserController.getLoggedUser)
router.get('/:name', UserController.getByName)
router.get('/id/:_id', UserController.getById)




module.exports = router