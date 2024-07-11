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
}

module.exports = CommentController;