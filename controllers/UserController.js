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
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET)
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
    const token = req.headers.authorization;
    // Verify token and handle errors

    const userLog = await jwt.verify(token, process.env.JWT_SECRET);
    if (!userLog) {
      return res.status(401).send({ message: 'Token no valido' });
    }

    // Fetch user data and populate posts (Handling Promise)
    const user = await User.findById(userLog._id).populate({
      path: 'posts',
      model: 'Post',
      localField: 'posts',
      following,
      followers, 
    })

    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado asignado a ese token' });
    }

    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      posts: user.posts, // Include populated posts in the response
    };

    res.json({ user: userInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al obtener información del usuario' }); // Generic error message
  }
},

async getByName(req, res) {
  try {
    // Filter users by name (partial match, case-insensitive)
    const filters = {};
    if (req.params.name) {
      filters.name = { $regex: req.params.name.toLowerCase(), $options: 'i' }; 
    }

    // Find one user matching the filter (or null if no match)
    const user = await User.findOne(filters);

    // Check if user found
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    // Send successful response with the user object
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al obtener usuario' });
  }
},


async getById(req, res) {
  try {
    // Find user by ID
    const user = await User.findById(req.params._id);

    // Check if user found
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    // Send successful response with the user object
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al obtener usuario' });
  }
},

async follow(req, res, next) {
  try {
    const { userIdToFollow } = req.params; // User ID to follow

    // Check if user exists
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      return res.status(404).send({ message: 'Usuario a seguir no encontrado' });
    }

    // Check if user is trying to follow themselves
    if (userToFollow._id.equals(req.user._id)) {
      return res.status(400).send({ message: 'No puedes seguirte a ti mismo' });
    }

    // Check if user is already following
    const isAlreadyFollowing = req.user.following.some(
      (followingId) => followingId.equals(userIdToFollow)
    );
    if (isAlreadyFollowing) {
      return res.status(400).send({ message: 'Ya estás siguiendo a este usuario' });
    }

    // Update following and followers arrays
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { following: userIdToFollow } },
      { new: true } // Return the updated user
    );
    await User.findByIdAndUpdate(
      userIdToFollow,
      { $push: { followers: req.user._id } },
      { new: true }
    )
    res.status(200).send({ message: 'Siguiendo a usuario con éxito' });
  } catch (error) {
    console.error(error);
    next(error);
  }
},

async unfollow(req, res, next) {
  try {
    const { userIdToUnfollow } = req.params; // User ID to unfollow

    // Check if user exists
    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow) {
      return res.status(404).send({ message: 'Usuario a dejar de seguir no encontrado' });
    }

    // Check if user is already following
    const isFollowing = req.user.following.some(
      (followingId) => followingId.equals(userIdToUnfollow)
    );
    if (!isFollowing) {
      return res.status(400).send({ message: 'No estás siguiendo a este usuario' });
    }

    // Update following and followers arrays
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: userIdToUnfollow } },
      { new: true } // Return the updated user
    );
    await User.findByIdAndUpdate(
      userIdToUnfollow,
      { $pull: { followers: req.user._id } },
      { new: true }
    );

    res.status(200).send({ message: 'Usuario dejado de seguir con éxito' });
  } catch (error) {
    console.error(error);
    next(error);
  }
},

 }

module.exports = UserController