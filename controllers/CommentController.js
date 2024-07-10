const Comments = require('../models/Comment')

const CommentController = {

 async create(req, res) {
   try {
     const comment = await Comment.create(req.body)
     res.status(201).send({message: 'Comentario creado con éxito', comment})
   } catch (error) {
     console.error(error)
     res
       .status(500)
       .send({ message: 'Ha habido un problema al crear el comentario' })
   }
 },

 async insertComment(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        {$push: { posts: { comment: req.body.comment, userId: req.user._id }},
        }, { new: true })
      res.send(comment)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Ha habido un problema al postear el comentario' })
    }
  },
 
 async getAll(req, res) {
    try {
      const comment = await Comment.find()
      res.status(200).send(comment)
    } catch (error) {
      console.error(error)
    }
  },

  async getById(req, res) {
    try {
      const comments = await Comment.findById(req.params._id)
      res.status(200).send(comment)
    } catch (error) {
      console.error(error)
    }
  },
 
  async getCommentByTitle(req, res) {
    try {
      if (req.params.title.length > 20) {
        return res.status(400).send('Búsqueda demasiado larga')
      }
      const title = new RegExp(req.params.title, 'i')
      const comments = await Coment.find({
        $text: {
          $search: req.params.title,
        },
      })
      res.send(comments)
    } catch (error) {
      console.log(error)
    }
  },

  async delete(req, res) {
    try {
      const comment = await Comment.findByIdAndDelete(req.params._id)
      res.send({ post, message: 'Comentario eliminado con éxito' })
    } catch (error) {
      console.error(error)
      res.status(500).send({
          message: 'Ha habido algún problema para eliminar el comentario',
        })
    }
  },
 
  async update(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        req.body,
        { new: true }
      )
      res.send({ message: 'Comentario actualizado correctamente', Comment })
    } catch (error) {
      console.error(error)
    }
  },
 
 
 }
module.exports = CommentController