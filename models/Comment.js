const mongoose = require('mongoose')
const ObjectId = mongoose.SchemaTypes.ObjectId

const CommentSchema = new mongoose.Schema(
 {
   comment: String,
   date: Date,
   posts: [
    { 
    postId: { type: ObjectId, ref: 'Post' },
    comment: String,
    },
   ],
 },
 { timestamps: true }
)

const Comment = mongoose.model('Comment', CommentSchema)
module.exports = Comment