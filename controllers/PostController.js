  const cloudinary = require('../config/cloudinaryConfig');
  const Post = require("../models/Post");
  const User = require("../models/User");

  const PostController = {

    // CREATE POST
    async create(req, res) {
      try {
        const { title, body } = req.body;

        if (!title || !body) {
          return res.status(400).send({ message: 'El título y el cuerpo del post son obligatorios.' });
        }

        let imageUrl;
        if (req.file) {
          imageUrl = req.file.path; // Assuming this is the path to the uploaded image
        }

        const post = await Post.create({
          title,
          body,
          userId: req.user._id,
          imageUrl,
        });

        await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

        res.status(201).send({ message: "Post creado con éxito", post });
      } catch (error) {
        console.error('Error al crear el post:', error);
        res.status(500).send({ message: 'Error al crear el post. Intenta de nuevo más tarde.', error: error.message });
      }
    },

    async update(req, res) {
      try {
        const postId = req.params._id;
        const updateData = { ...req.body };
  
        // Verifica si se ha proporcionado un nuevo archivo
        if (req.file) {
          // Subir la nueva imagen a Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);
          updateData.imageUrl = result.secure_url; // Almacena la nueva URL segura
        }
  
        // Actualiza el post en la base de datos
        const post = await Post.findByIdAndUpdate(postId, updateData, { new: true });
        if (!post) {
          return res.status(404).send({ message: 'Post no encontrado.' });
        }
  
        // Devuelve la respuesta con el post actualizado
        res.status(200).send({ message: 'Post actualizado con éxito', post });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al actualizar el post. Intenta de nuevo más tarde.', error: error.message });
      }
    },
  
    async delete(req, res) {
      try {
        const deletedPost = await Post.findByIdAndDelete(req.params._id);
        if (!deletedPost) {
          return res.status(404).send({ message: 'Post no encontrado.' });
        }
  
        // Eliminar la referencia del post del modelo de usuario
        await User.findByIdAndUpdate(req.user._id, { $pull: { posts: deletedPost._id } });
  
        res.status(200).send({ message: 'Post eliminado con éxito' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al eliminar el post. Intenta de nuevo más tarde.', error: error.message });
      }
    },

    // GET ALL POSTS
    async getAll(req, res) {
      try {
        const posts = await Post.find()
          .populate({ path: 'userId', select: 'username profileImageUrl' })
          .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } });

        res.status(200).send(posts);
      } catch (error) {
        console.error('Error al obtener posts:', error);
        res.status(500).send({ message: 'Error al obtener posts. Intenta de nuevo más tarde.', error: error.message });
      }
    },

    // GET ALL PAGES
    async getAllPages(req, res) {
      try {
        const { page = 1, limit = 10 } = req.query;
        const posts = await Post.find()
          .populate({ path: 'userId', select: 'username profileImageUrl' })
          .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));

        res.status(200).send(posts);
      } catch (error) {
        console.error('Error al obtener posts:', error);
        res.status(500).send({ message: 'Error al obtener posts. Intenta de nuevo más tarde.', error: error.message });
      }
    },

    // GET POST BY ID
    async getById(req, res) {
      try {
        const post = await Post.findById(req.params._id)
          .populate({ path: 'userId', select: 'username profileImageUrl' })
          .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } });

        if (!post) {
          return res.status(404).send({ message: 'Post no encontrado.' });
        }
        res.status(200).send(post);
      } catch (error) {
        console.error('Error al obtener post por ID:', error);
        res.status(500).send({ message: 'Error al obtener post por ID. Intenta de nuevo más tarde.', error: error.message });
      }
    },

    // GET POST BY USER
    async getPostsByUser(req, res) {
      try {
        const userId = req.params.userId;
        const posts = await Post.find({ userId })
          .populate({ path: 'userId', select: 'username profileImageUrl' })
          .populate({ path: 'comments', populate: { path: 'userId', select: 'username profileImageUrl' } });

        // Return an empty array with a 200 status if no posts are found
        res.status(200).send(posts);
      } catch (error) {
        console.error('Error al obtener posts del usuario:', error);
        res.status(500).send({ message: 'Error al obtener posts del usuario.', error: error.message });
      }
    },

    // LIKE POST
    async like(req, res) {
      try {
        const postId = req.params._id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).send({ message: 'Post no encontrado.' });
        }

        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
          post.likes.pull(userId); // Remove like
        } else {
          post.likes.push(userId); // Add like
        }

        await post.save();

        res.status(200).send({ message: 'Like actualizado con éxito', post });
      } catch (error) {
        console.error('Error al dar like al post:', error);
        res.status(500).send({ message: 'Error al dar like al post. Intenta de nuevo más tarde.', error: error.message });
      }
    },
  };

  module.exports = PostController;
