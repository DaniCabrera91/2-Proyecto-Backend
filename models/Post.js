const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaTypes.ObjectId;

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor introduce un título'],
    unique: false,
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
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

PostSchema.index({ title: 'text' }, { unique: false });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
