const User = require('../models/User')
const Post = require('../models/Post')
// const Comment = require('../models/Comment')

const jwt = require('jsonwebtoken')
require('dotenv').config()

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: payload._id, tokens: token })
    if (!user) {
      return res.status(401).send({ message: 'No estás autorizado' })
    }
    req.user = user
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error, message: 'Ha habido un problema con el token' })
  }
}

const isAdmin = async (req, res, next) => {
    const admins = ['admin', 'superadmin']
    if (!admins.includes(req.user.role)) {
      return res.status(403).send({
        message: 'You do not have permission',
      })
    }
    next()
}

const isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params._id)
    if (!post) {
      return res.status(404).send({ message: 'Post no encontrado' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'No tienes la autoría de esta publicación' })
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error a la hora de comprobar la autoría' })
  }
   }
   
   
module.exports = { authentication, isAdmin, isAuthor }