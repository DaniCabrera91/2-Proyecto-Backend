const mongoose = require('mongoose')
const ObjectId = mongoose.SchemaTypes.ObjectId


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor rellena tu nombre'],
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, 'Este correo no es válido'],
    unique: true,
    required: [true, 'Por favor rellena tu correo'],
  },
  password: {
    type: String,
    required: [true, 'Por favor rellena tu contraseña'],
  },
  age: {
    type: Number,
    required: [true, 'Por favor rellena tu edad'],
  },
  role: String,
  tokens: [],
  wishList: [{ type: ObjectId, ref: 'Post' }],
  posts: [{ type: ObjectId, ref: 'Post' }],
  followers: [{ type: ObjectId, ref: 'User' }],
  following: [{ type: ObjectId, ref: 'User' }],
},
{ timestamps: true }
)
const User = mongoose.model('User', UserSchema)

module.exports = User

