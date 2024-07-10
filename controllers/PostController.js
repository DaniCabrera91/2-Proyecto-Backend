const Post = require('../models/Post')
const jwt = require('jsonwebtoken')

const PostController = {
  
  async create(req, res) {
    const { title, body } = req.body
    if (!title || !body) {
      return res.status(400).send({ message: 'Title and body are required fields' })
    }
    try {
      const newPost = await Post.create({ title, body })
      res.status(201).send(newPost)
    } catch (error) {
      console.error(error)
  
      if (error.name === 'ValidationError') {
        return res.status(400).send({ message: 'Validation error: ' + error.message })
      } else {
        return res.status(500).send({ message: 'Error creating post' })
      }
    }
  },

 async update(req, res) {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params._id,
      req.body,
      { new: true }
    )
    res.send({ message: 'Post actualizado correctamente', post })
  } catch (error) {
    console.error(error)
  }
},

async delete(req, res) {
  try {
    const post = await Post.findByIdAndDelete(req.params._id)
    res.send({ post, message: 'Post eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).send({
        message: 'Hubo un problema al eliminar el post',
      })
  }
},

 async getAllPages(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query
    const posts = await Post.find()
      .populate ('comments.userId')
      .limit(limit)
      .skip((page - 1) * limit)
    res.send(posts)
  } catch (error) {
    console.error(error)
  }
},

 async getPostsByName(req, res) {
  try {
    const name = new RegExp(req.params.name, 'i')
    const posts = await Post.find({ name })
    res.send(posts)
  } catch (error) {
    console.log(error)
  }
},

async getById(req, res) {
  try {
    const post= await Post.findById(req.params._id)
    res.send(post)
  } catch (error) {
    console.error(error)
  }
},

async like(req, res) {
  try {
    const post = await Pots.findByIdAndUpdate(
      req.params._id,
      { $push: { likes: req.user._id } },
      { new: true })
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { wishList: req.params._id } },
      { new: true })
    res.send(post)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: "Hay habido un problema con tu petición" })
  }
},
 
}

module.exports = PostController