const Comment = require("../models/Comment");
const Post = require("../models/Post");

const CommentController = {
  async create(req, res) {
    try {
      const postId = req.params._id;
      if (!req.body.comment) {
        return res.status(400).send({ message: 'El comentario no puede estar vacío.' });
      }

      const comment = await Comment.create({
        ...req.body,
        postId,
        userId: req.user._id,
      });

      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true }
      );

      res.status(201).send({ message: 'Comentario creado con éxito', comment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al crear el comentario', error: error.message });
    }
  },

  async updateComment(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { comment: req.body.comment },
        { new: true }
      );

      if (!comment) {
        return res.status(404).send({ message: 'Comentario no encontrado' });
      }

      res.send({ message: 'Comentario actualizado con éxito', comment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error actualizando el comentario', error: error.message });
    }
  },

  async deleteComment(req, res) {
    try {
      const deletedComment = await Comment.findByIdAndDelete(req.params._id);
      if (!deletedComment) {
        return res.status(404).send({ message: 'Comentario no encontrado' });
      }
      res.status(200).send({ message: 'Comentario eliminado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error eliminando el comentario', error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.params.id) {
        filters.postId = req.params.id;
      }
      const comments = await Comment.find(filters);
      res.status(200).send(comments);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener comentarios', error: error.message });
    }
  },

  async like(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        { $push: { likes: req.user._id } },
        { new: true }
      );

      if (!comment) {
        return res.status(404).send({ message: 'Comentario no encontrado' });
      }

      res.send({ message: 'Like dado con éxito', comment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al dar like al comentario', error: error.message });
    }
  },

  async removeLike(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id, 
        { $pull: { likes: req.user._id } },
        { new: true }
      );

      if (!comment) {
        return res.status(404).send({ message: 'Comentario no encontrado' });
      }

      res.send({ message: 'Like quitado con éxito', comment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al quitar el like del comentario', error: error.message });
    }
  },
};

module.exports = CommentController;
