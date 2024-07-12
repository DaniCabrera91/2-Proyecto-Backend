const mongoose = require("mongoose");
const ObjectId = mongoose.SchemaTypes.ObjectId;

const CommentSchema = mongoose.Schema(
  {
    comment: { type: String, required: [true, 'Por favor introduce un comentario'] },
    postId: { type: ObjectId, ref: "Post",  required: true },
    userId: { type: ObjectId, ref: "User", required: true},
    likes: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

CommentSchema.index({
  content: "text",
})

const Comment = mongoose.model("Comment", CommentSchema)

module.exports = Comment