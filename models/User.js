const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
 {
   name: { type: String, required: true },   
   email: { type: String, required: true, unique: true }, // Restricción de email único
   password: { type: String, required: true },
   age: Number,
   tokens: [],
   role: String,
 },
 { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

module.exports = User

