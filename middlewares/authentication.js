const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens': token });

    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Por favor autenticarse' });
  }
};

const isAdmin = async (req, res, next) => {
  const admins = ['admin', 'superadmin'];
  if (!req.user || !admins.includes(req.user.role)) {
    return res.status(403).send({
      message: 'No tienes permiso para acceder a este recurso',
    });
  }
  next();
};

const isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params._id);
    if (!post) {
      return res.status(404).send({ message: 'Publicación no encontrada' });
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'No tienes la autoría de esta publicación' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error a la hora de comprobar la autoría' });
  }
};

module.exports = { authentication, isAdmin, isAuthor };
