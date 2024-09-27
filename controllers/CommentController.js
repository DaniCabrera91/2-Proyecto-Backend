const Comment = require("../models/Comment");
const Post = require("../models/Post");

const CommentController = {
  // Crear comentario
  async create(req, res) {
    try {
      const { comment } = req.body;
      const { _id: postId } = req.params;

      if (!comment) {
        return res.status(400).send({ message: "El comentario no puede estar vacío." });
      }

      const newComment = await Comment.create({
        comment,
        userId: req.user._id, // Almacena el ID del usuario que crea el comentario
        postId,
      });

      await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

      res.status(201).send({ message: "Comentario creado con éxito", comment: newComment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al crear comentario.", error: error.message });
    }
  },

  // Obtener los dos comentarios más recientes de un post
  async getRecentCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      const comments = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate({ path: "userId", select: "username profileImageUrl" }); // Asegúrate de poblar el usuario

      res.status(200).send(comments);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al obtener comentarios recientes.", error: error.message });
    }
  },
  
  // Obtener todos los comentarios de un post
  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      const comments = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .populate({ path: "userId", select: "username profileImageUrl" }); // Asegúrate de poblar el usuario

      res.status(200).send(comments);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al obtener los comentarios.", error: error.message });
    }
  },

  async getCommentsCountByPost(req, res) {
    try {
      const { postId } = req.params;
      const count = await Comment.countDocuments({ postId }); // Cuenta los comentarios para el post
      res.status(200).send({ count }); // Envía el recuento de comentarios
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al contar comentarios.", error: error.message });
    }
  },

  // Eliminar comentario
  async deleteComment(req, res) {
    try {
      const { _id } = req.params;
      const comment = await Comment.findById(_id);

      if (!comment) {
        return res.status(404).send({ message: "Comentario no encontrado." });
      }

      if (comment.userId.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: "No tienes permiso para eliminar este comentario." });
      }

      await Comment.findByIdAndDelete(_id);
      await Post.findByIdAndUpdate(comment.postId, { $pull: { comments: _id } });

      res.status(200).send({ message: "Comentario eliminado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al eliminar comentario.", error: error.message });
    }
  },

  // Dar o quitar like a un comentario
  async like(req, res) {
    try {
      const { _id } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(_id);
      if (!comment) {
        return res.status(404).send({ message: "Comentario no encontrado." });
      }

      const hasLiked = comment.likes.includes(userId);
      if (hasLiked) {
        comment.likes.pull(userId); // Quitar "like"
      } else {
        comment.likes.push(userId); // Agregar "like"
      }

      await comment.save();
      res.status(200).send({ message: "Like actualizado con éxito", comment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al dar like al comentario.", error: error.message });
    }
  },
};

module.exports = CommentController;
