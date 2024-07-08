const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { jwt_secret } = require('../config/keys')

const UserController = {

  
  async register(req, res) {
    try {
      const requiredFields = ['name', 'email', 'password']
      const missingFields = requiredFields.filter(field => !req.body[field])
      if (missingFields.length) {
        return res.status(400).send({
          message: 'Por favor rellena todos los campos',
        })
      }
      // Validación Email:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).send({ message: 'Correo electrónico no válido' })
      }
      const existingUser = await User.findOne({ email: req.body.email })
      if (existingUser) {
        return res.status(400).send({ message: 'El correo electrónico ya está en uso' })
      }
      // Bcrypt:
      const passwordHash = await bcrypt.hashSync(req.body.password, 10)
      const user = await User.create({
        ...req.body,
        password: passwordHash,
        role: 'user',
      })
      res.status(201).send({ message: 'Usuario registrado con éxito', user })
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        return res.status(400).send({ message: 'El correo electrónico ya está en uso' })
      }
      res.status(500).send({ message: 'Error al registrar el usuario' })
    }
  },

 async getLoggedUser(req, res) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Authorization header missing' })
    }
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, jwt_secret)
    const user = await User.findById(decoded._id)
    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }
    res.json({ user })
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send({ message: 'Invalid authorization token' })
    }
    res.status(500).send({ message: 'Internal server error' })
  }
}, 

 async login(req, res) {
    try {
      const user = await User.findOne({
        email: req.body.email,
      })
      const token = jwt.sign({ _id: user._id }, jwt_secret)
      if (user.tokens.length > 4) user.tokens.shift()
      user.tokens.push(token)
      await user.save()
      res.send({ message: 'Bienvenid@ ' + user.name, token })
    } catch (error) {
      console.error(error)
    }
  },
 
  async logout(req, res) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: req.headers.authorization },
      })
      res.send({ message: 'Desconectado con éxito' })
    } catch (error) {
      console.error(error)
      res.status(500).send({
        message: 'Hubo un problema al intentar desconectar al usuario',
      })
    }
  },
 }

module.exports = UserController