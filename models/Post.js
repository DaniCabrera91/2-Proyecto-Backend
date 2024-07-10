const mongoose = require('mongoose')
const ObjectId = mongoose.SchemaTypes.ObjectId

const PostSchema = new mongoose.Schema(
 {
   title: { type: String},   
   body: { type: String},
   userId: { type: ObjectId, ref: 'User' },

   likes: [{ type: ObjectId }],
   comments: [
    {
      userId: { type: ObjectId, ref: 'User' },
      commentId: { type: ObjectId, ref: 'Comment' },
    },
  ],

 },
 { timestamps: true }
)

const Post = mongoose.model('Post', PostSchema)

module.exports = Post