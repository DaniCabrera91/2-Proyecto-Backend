const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const UserController = {

  async register(req, res, next) {
    try { 
      const passwordHash = await bcrypt.hashSync(req.body.password, 10)
      const user = await User.create({
        ...req.body,
        role: 'user',
        password: passwordHash, 
      })
      res.status(201).send({ message: "Usuario registrado con éxito", user })
    } catch (error) {
      error.origin = 'usuario'
      next(error)
    }
  },
  
  async updateUser(req, res, next) {
    try {
      if (req.body.password) {
        const passwordHash = await bcrypt.hashSync(req.body.password, 10)
        req.body.password = passwordHash
      }
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
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).send({ message: 'Se requieren un correo electrónico y una contraseña válidos' })
      }
      const existingUser = await User.findOne({ email })
      if (!existingUser) {
        const newUser = new User({ email, password })
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET)
        await newUser.save();
        return res.send({ message: 'Bienvenido ' + newUser.name, token })
      }
      const isPasswordValid = await bcrypt.compare(password, existingUser.password)
      if (!isPasswordValid) {
        return res.status(401).send({ message: 'Correo electrónico o contraseña incorrectos' })
      }  
      const existingToken = existingUser.tokens.find((token) => token)
      if (existingToken) {
        return res.status(400).send({ message: 'Ya estás loggeado, desconectate antes de volver a logearte'})
      }
      const newToken = jwt.sign({ _id: existingUser.id }, process.env.JWT_SECRET)
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
      const { page = 1, limit = 10 } = req.query
      const users = await User.find()
        .limit(limit)
        .skip((page - 1) * limit)
      res.send(users)
    } catch (error) {
      console.error(error)
    }
  },

  async getLoggedUser(req, res) {
    try {
      const user = await User.aggregate([
        { $match: { _id: req.user._id } }, // Match the current user
        {
          $lookup: {
            from: "users", // Reference the 'users' collection
            localField: "followers", // Local field in the user document
            foreignField: "_id", // Foreign field in the user document
            as: "followers", // Alias for the lookup results
          },
        },
        {
          $addFields: {
            followerCount: { $size: "$followers" }, // Calculate follower count
          },
        },
      
      ]);
  
      if (!user.length) { // Handle no user found
        return res.status(404).send({ message: 'Usuario no encontrado' });
      }
  
      res.send(user); // Send the first user object from the aggregation result
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'Error al mostrar la información del usuario conectado' });
    }
  },

async getByName(req, res) {
  try {
    const filters = {}
    if (req.params.name) {
      filters.name = { $regex: req.params.name.toLowerCase(), $options: 'i' }
    }
    const user = await User.findOne(filters)
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' })
    }
    res.status(200).send(user)
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al obtener usuario' })
  }
},

async getById(req, res) {
  try {
    // Find user by ID
    const user = await User.findById(req.params._id)
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' })
    }
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al obtener usuario' })
  }
},

async follow(req, res) {
  try {
    if (`${req.params.id}` === `${req.user._id}`) {
      return res.status(400).send('No puedes seguirte a ti mismo...')
    }
  
     await User.findByIdAndUpdate(req.params.id, 
      { $push: { followers: req.user._id }},
      {new: true}
    )
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { follows: req.params.id } },
      { new: true }
    )
    res.status(201).send({message: 'Usuario seguido con éxito',user})
  } catch (error) {
    console.error(error);
    res.status(400).send('Problema al seguir usuario')
  }
},

async unfollow(req, res) {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { follows: req.params.id } },
      { new: true }
    )

    res.status(201).send({message: 'Usuario dejado de seguir con éxito',user})
  } catch (error) {
    res.status(400).send('Problema al dejar de seguir usuario')
  }
},

}

module.exports = UserController



