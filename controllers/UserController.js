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

  async updateUser(req, res) {
    try {
      // Validate updated email (if changed)
      if (req.body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).send({ message: 'Correo electrónico no válido' })
        }
      }
      // Hash password if provided and updated
      if (req.body.password) {
        const passwordHash = await bcrypt.hashSync(req.body.password, 10)
        req.body.password = passwordHash
      }
  
      // Check if user exists
      const user = await User.findByIdAndUpdate(
        req.params._id,
        req.body,
        { new: true }
      );
  
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }
      res.send({ message: 'Usuario actualizado con éxito', user })
    } catch (error) {
      console.error(error)
      res.status(400).send({ message: 'Error al actualizar el usuario' })

    }
  },

  async getAll(req, res) {
    try {
      // Filter users based on query parameters (optional)
      const filters = {};
      if (req.query.name) {
        filters.name = new RegExp(req.query.name, 'i'); // Case-insensitive search by name
      }
      if (req.query.role) {
        filters.role = req.query.role;
      }
  
      // Get all users with filters applied
      const users = await User.find(filters);
  
      // Check if any users found
      if (!users.length) {
        return res.status(204).send({ message: 'No se encontraron usuarios' }); // 204 No Content
      }
  
      // Send successful response with list of users
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener usuarios' });
    }
  },

  async getLoggedUser(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      // Verify token and handle errors
      const userLog = await jwt.verify(token, jwt_secret);
      if (!userLog) {
        return res.status(401).send({ message: 'Invalid token' }); // Generic error for various verification failures
      }
      // Fetch user data
      const user = await User.findById(userLog._id);
      if (!user) {
        return res.status(404).send({ message: 'User not found for the provided token' })
      }
      // Filter sensitive data from user object
      const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        // Exclude sensitive fields like password or tokens
      }
      // Return filtered user data
      res.json({ user: safeUser })
    } catch (error) {
      console.error(error)
    }
  },

  
async login(req, res) {
  try {
    // Validación del correo electrónico
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send({ message: 'Se requieren un correo electrónico y una contraseña válidos' })
    }
    // Búsqueda del usuario en la base de datos
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).send({ message: 'Correo electrónico o contraseña incorrectos' })
    }
    // Comparación de contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Correo electrónico o contraseña incorrectos' })
    }
    const token = jwt.sign({ _id: user._id}, jwt_secret)
    if (user.tokens.length > 4) user.tokens.shift()
    user.tokens.push(token)
    await user.save()
    res.send({message: 'Bienvenid@' + user.name, token})
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Error al iniciar sesión' })
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