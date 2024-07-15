const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaTypes.ObjectId;

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor introduce un titulo'],
    unique: true, // Add unique validation
    validate: {
      validator: async (value) => {
        const existingPost = await Post.findOne({ title: value });
        return !existingPost; // Reject if title already exists
      },
      message: 'Ya existe un post con ese título.',
    },
  },
  
  body: {
    type: String,
    required: [true, 'Por favor añade contenido al post'],
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{ type: ObjectId, ref: 'User' }],
  comments: [{ type: ObjectId, ref: 'Comment' }],
}, { timestamps: true })

PostSchema.index({ title: 'text' }, { unique: false })

const Post = mongoose.model('Post', PostSchema)

module.exports = Post

