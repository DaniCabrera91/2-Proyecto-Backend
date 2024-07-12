const Comment = require("../models/Comment");
const Post = require("../models/Post");

const CommentController = {

  async create(req, res) {
    try {
      const comment = await Comment.create({
        ...req.body,
        postId: req.params.id,
        userId: req.user._id,
      })
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: comment._id,
          },
        },
        { new: true }
      )
      res
        .status(201)
        .send({ message: 'Comentario creado con éxito', comment})
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'No ha sido posible crear el comentario'})
    }
  },


  async like(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        {
          $push: {
            likes: req.user._id,
          },
        },
        { new: true } // Return the updated document
      )
  
      res.send({ message: 'Like dado con éxito', comment })
    } catch (error) {
      console.error(error)
      res.status(400).send({ message: 'No ha podido darse like al comentario' })
    }
  },
  
  async removeLike(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        {
          $pull: {
            likes: req.user._id,
          },
        },
        { new: true } // Return the updated document
      )
  
      res.send({ message: 'Like quitado con éxito', comment })
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'No ha podido eliminarse el like del comentario' })
    }
  }

}

module.exports = CommentController