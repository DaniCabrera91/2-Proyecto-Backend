const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { jwt_secret } = require('../config/keys')

const UserController = {

  async register(req, res, next) {
    try { 
      const passwordHash = await bcrypt.hashSync(req.body.password, 10)
      const user = await User.create({
        ...req.body,
        role: 'user',
        password: passwordHash, 
      });
  
      res.status(201).send({ message: "Usuario registrado con éxito", user })
    } catch (error) {
      error.origin = 'usuario'
      next(error)
    }
  },
  
  async updateUser(req, res, next) {
    try {
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
      )
  
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }
      res.send({ message: 'Usuario actualizado con éxito', user })
    } catch (error) {
      error.origin = 'usuario'
      next(error)
    }
  },

  async login(req, res) {
    try {
      // Validate email and password
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send({ message: 'Se requieren un correo electrónico y una contraseña válidos' });
      }
  
      // Check if user is already logged in
      const existingUser = await User.findOne({ email })
      if (!existingUser) {
        // User not found, proceed with normal login
        const newUser = new User({ email, password })
        const token = jwt.sign({ _id: newUser._id }, jwt_secret)
        await newUser.save();
        return res.send({ message: 'Bienvenido ' + newUser.name, token })
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, existingUser.password)
      if (!isPasswordValid) {
        return res.status(401).send({ message: 'Correo electrónico o contraseña incorrectos' })
      }
  
      // Comprobar si ya existe un token:
      const existingToken = existingUser.tokens.find((token) => token)
      if (existingToken) {
        return res.status(400).send({ message: 'Ya estás loggeado, desconectate antes de volver a logearte'})
      }
      const newToken = jwt.sign({ _id: existingUser.id }, jwt_secret)
      existingUser.tokens.push(newToken);
      await existingUser.save();
  
      res.send({ message: 'Bienvenido ' + existingUser.name, token: newToken })
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
  async getAll(req, res) {
    try {
      // Get all users without pagination
      const users = await User.find({});
  
      // Check if any users found
      if (!users.length) {
        return res.status(204).send({ message: 'No se encontraron usuarios' }); // 204 No Content
      }
  
      // Send successful response with all users
      res.status(200).send({ users });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener usuarios' });
    }
  },

  async getLoggedUser(req, res) {
    try {
      const token = req.headers.authorization
      // Verify token and handle errors
      const userLog = await jwt.verify(token, jwt_secret);
      if (!userLog) {
        return res.status(401).send({ message: 'Token no valido' })
      }
      // Fetch user data
      const user = await User.findById(userLog._id);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado asignado a ese token' })
      }

      // Filtrar datos sensibles excluyendolos de 
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
      // Return filtered user data
      res.json({ user: userInfo })
    } catch (error) {
      console.error(error)
    }
  },

  async getByName(req, res) {
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
 }

module.exports = UserController