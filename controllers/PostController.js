const cloudinary = require('../config/cloudinaryConfig')
const Post = require("../models/Post")
const User = require("../models/User")

const PostController = {
  async create(req, res) {
    try {
      const { title, body } = req.body

      if (!title || !body) {
        return res.status(400).send({ message: 'El título y el cuerpo del post son obligatorios.' })
      }

      let imageUrl
      if (req.file) {
        imageUrl = req.file.path
      }

      const post = await Post.create({
        title,
        body,
        userId: req.user._id,
        imageUrl,
      })

      await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } })

      res.status(201).send({ message: "Post creado con éxito", post })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al crear el post. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async update(req, res) {
    try {
      const updateData = { ...req.body }

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path)
        if (!result || !result.secure_url) {
          return res.status(500).send({ message: 'No se ha podido subir la imagen a Cloudinary. Intenta de nuevo más tarde.' })
        }
        updateData.imageUrl = result.secure_url
      }

      const post = await Post.findByIdAndUpdate(req.params._id, updateData, { new: true })
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado.' })
      }
      res.status(200).send({ message: 'Post actualizado con éxito', post })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al actualizar el post. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async delete(req, res) {
    try {
      const deletedPost = await Post.findByIdAndDelete(req.params._id)
      if (!deletedPost) {
        return res.status(404).send({ message: 'Post no encontrado.' })
      }
      res.status(200).send({ message: 'Post eliminado con éxito' })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al eliminar el post. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async getAll(req, res) {
    try {
      const posts = await Post.find()
        .populate({ path: 'userId', select: 'username profileImageUrl' })
        .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } })

      res.status(200).send(posts)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener posts. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async getAllPages(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query
      const posts = await Post.find()
        .populate({ path: 'userId', select: 'username profileImageUrl' })
        .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))

      res.status(200).send(posts)
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener posts. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async getById(req, res) {
    try {
      const post = await Post.findById(req.params._id)
        .populate({ path: 'userId', select: 'username profileImageUrl' })
        .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } })

      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado.' })
      }
      res.status(200).send(post)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener post por ID. Intenta de nuevo más tarde.', error: error.message })
    }
  },
  
  async getPostsByUser(req, res) {
    try {
      const userId = req.params.userId;
      const posts = await Post.find({ userId })
        .populate({ path: 'userId', select: 'username profileImageUrl' })
        .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } });

      if (!posts || posts.length === 0) {
        return res.status(404).send({ message: 'No se encontraron posts para este usuario.' });
      }

      res.status(200).send(posts);
    } catch (error) {
      console.error('Error al obtener posts del usuario:', error);
      res.status(500).send({ message: 'Error al obtener posts del usuario.', error: error.message });
    }
  },

  async like(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(req.params._id, { $push: { likes: req.user._id } }, { new: true })
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado.' })
      }
      res.status(200).send({ message: 'Like dado con éxito', post })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al dar like al post. Intenta de nuevo más tarde.', error: error.message })
    }
  },

  async removeLike(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(req.params._id, { $pull: { likes: req.user._id } }, { new: true })
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado.' })
      }
      res.status(200).send({ message: 'Like quitado con éxito', post })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al quitar el like del post. Intenta de nuevo más tarde.', error: error.message })
    }
  }
}

module.exports = PostController
