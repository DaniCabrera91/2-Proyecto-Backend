const Post = require("../models/Post");
const User = require("../models/User");

const PostController = {
  async create(req, res, next) {
    try {
      const post = await Post.create({ ...req.body, userId: req.user._id });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { posts: post._id },
      });

      res.status(201).send({ message: "Post creado con éxito", post });
    } catch (error) {
      console.error(error);
      error.origin = "post";
      next(error);
    }
  },

  async getAllPages(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      const posts = await Post.find()
        // Populate post author (userId)
        .populate({ path: 'userId', select: 'name + email' })
  
        // Populate comments with username from userId
        .populate({
          path: 'comments',
          populate: { path: 'userId', select: 'name + email' }, // Select only username from user
        })
        .limit(limit)
        .skip((page - 1) * limit);
  
      res.send(posts);
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'Problema al mostrar los posts' });
    }
  },

  async update(req, res) {
    try {
      const updateData = {
        ...req.body, // Include all properties from request body (for multiple updates)
      };
  
      const post = await Post.findByIdAndUpdate(
        req.params._id, // Use req.params.id for clarity
        updateData,
        { new: true }
      )
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado con ese id' })
      }
      res.status(200).send({ message: 'Post actualizado con éxito', post })// Success message and updated post
    } catch (error) {
      console.error(error)
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        res.status(400).send({ message: 'Error de validación: ' + messages.join(', ') })
      } else {
        res.status(500).send({ message: "No ha sido posible actualizar el post" })
      }
    }
  },

  async delete(req, res) {
    try {
      await Post.findByIdAndDelete(req.params._id)
      res.send({ message: 'Post eliminado con éxito' })
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'No ha sido posible eliminar el post' })
    }
  },

  async getPostsByTitle(req, res) {
    try {
      const posts = await Post.find({
        $text: {
          $search: req.params.title,
        },
      }).populate("userId comments likes");
      res.send(posts);
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'no se ha encontrado ningun post con ese título'});
    }
  },

  async getById(req, res) {
    try {
      const post = await Post.findById(req.params._id).populate(
        "userId comments likes"
      )
      res.send(post);
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'No han podido encontrarse el post por ID' })
    }
  },

  async like(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params._id,
        {
          $push: {
            likes: req.user._id,
          },
        },
        { new: true }
      );
      res.send({message: 'Like dado con éxito', post})
    } catch (error) {
      console.error(error)
      res.status(400).send({ message: 'No ha podido darse like al post' })
    }
  },

  async removeLike(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params._id,
        
        {
          $pull: {
            likes: req.user._id,
          },
        },
        { new: true }
      )
      res.send({message: 'Like quitado con éxito', post})   
    } catch (error) {
      console.error(error)
      res.status(400).send({ message: 'No ha podido eliminarse el like del post' })
    }
  },
}

module.exports = PostController