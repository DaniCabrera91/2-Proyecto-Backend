const mongoose = require('mongoose')
const ObjectId = mongoose.SchemaTypes.ObjectId

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Por favor rellena tu nombre'],
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Por favor rellena tu nombre de usuario'],
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
    minlength: 6,
  },
  role: {
    type: String,
    default: 'user',
  },
  tokens: [],
  wishList: [{ type: ObjectId, ref: 'Post' }],
  posts: [{ type: ObjectId, ref: 'Post' }],
  follows: [{ type: ObjectId, ref: 'User' }],
  followers: [{ type: ObjectId, ref: 'User' }],
  profileImageUrl: { type: String },
}, { timestamps: true })

UserSchema.methods.toJSON = function () {
  const user = this._doc
  delete user.tokens
  delete user.password
  return user
};

const User = mongoose.model('User', UserSchema)

module.exports = User
