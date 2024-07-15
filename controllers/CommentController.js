const Comment = require("../models/Comment");
const Post = require("../models/Post");

const CommentController = {

  async create(req, res) {
    try {
      const postId = req.params._id
      const comment = await Comment.create({
        ...req.body,
        postId,
        userId: req.user._id,
      })
      await Post.findByIdAndUpdate(
        req.params._id,
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

  async updateComment(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { comment: req.body.comment },
        { new: true }
      );
      res.send(comment);
    } catch (error) {
      console.error(error);
      res.status(400).send("Error trying to update comment");
    }
  },

  async deleteComment(req, res) {
    try {
      const deletedComment = await Comment.findByIdAndDelete(req.params._id);
      if (!deletedComment) {
        return res.status(404).send("Comment not found");
      }
      res.send("Comment deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting comment");
    }
  },


  async getAll(req, res) {
    try {
      // Filter comments based on post ID (optional)
      const filters = {};
      if (req.params.id) {
        filters.postId = req.params.id;
      }
  
      // Find comments matching the filter
      const comments = await Comment.find(filters);
  
      // Send successful response with comments array
      res.status(200).send(comments);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener comentarios' });
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
        { new: true }
      )
      res.send({message: 'Like quitado con éxito', comment})   
    } catch (error) {
      console.error(error)
      res.status(400).send({ message: 'No ha podido eliminarse el like del comentario' })
    }
  },

}

module.exports = CommentController