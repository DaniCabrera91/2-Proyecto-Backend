const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
 {
   title: { type: String},   
   body: { type: String},
 },
 { timestamps: true }
)

const Post = mongoose.model('Post', UserSchema)

module.exports = Post