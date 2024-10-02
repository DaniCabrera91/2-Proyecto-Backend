const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Asegúrate de tener el modelo de comentarios
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).send({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens': token });

    if (!user) {
      return res.status(401).send({ message: 'User not found' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).send({ message: 'No estás autenticado' });
  }
}

const isAdmin = async (req, res, next) => {
  const admins = ['admin', 'superadmin'];
  if (!req.user || !admins.includes(req.user.role)) {
    return res.status(403).send({
      message: 'No tienes permiso para acceder a este recurso',
    });
  }
  next();
}

const isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params._id)
    if (!post) {
      return res.status(404).send({ message: 'Publicación no encontrada' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'No tienes la autoría de esta publicación' })
    }
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Error a la hora de comprobar la autoría' })
  }
}

const isCommentAuthor = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params._id); // Asegúrate de que el id del comentario se pasa correctamente
    if (!comment) {
      return res.status(404).send({ message: 'Comentario no encontrado' });
    }
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'No tienes la autoría de este comentario' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error a la hora de comprobar la autoría' });
  }
}


module.exports = { authentication, isAdmin, isAuthor, isCommentAuthor };
