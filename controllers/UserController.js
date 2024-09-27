const cloudinary = require('../config/cloudinaryConfig')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const upload = require('../middlewares/multerConfig')
require('dotenv').config()

const UserController = {
  uploadImage: upload.single('profileImage'),

  async register(req, res, next) {
    try {
      const { firstName, username, email, password } = req.body
      const passwordHash = await bcrypt.hash(password, 10)

      let profileImageUrl = 'https://res.cloudinary.com/dyt3uvyo7/image/upload/v1726906771/user_uploads/ykklfbd4uewiexlicycv.png'
      
      if (req.file) {
        profileImageUrl = req.file.path
      }

      const user = await User.create({
        firstName,
        username,
        email,
        password: passwordHash,
        profileImageUrl,
        role: 'user',
      })

      res.status(201).send({ message: "Usuario registrado con éxito", user })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al registrar el usuario', error: error.message })
    }
  },

  async updateUser(req, res) {
    try {
      const userId = req.params._id; // Obtiene el ID del usuario
      const updates = req.body; // Obtiene los datos que deseas actualizar
  
      // Si tienes una imagen, actualiza la URL en `updates`
      if (req.file) {
        updates.profileImageUrl = req.file.path; // Ajusta según tu lógica de almacenamiento
      }
  
      // Busca y actualiza el usuario
      const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Envía la respuesta con el usuario actualizado en un objeto
      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
  },
  

  async login(req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado.' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).send({ message: 'Contraseña incorrecta.' })
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })

      user.tokens.push(token)
      await user.save()

      res.status(200).send({ message: 'Inicio de sesión exitoso', user, token })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al iniciar sesión', error: error.message })
    }
  },

  async logout(req, res) {
    try {
      const token = req.token
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: token },
      })
      res.send({ message: 'Desconectado con éxito' })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al desconectar al usuario', error: error.message })
    }
  },
  

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query
      const users = await User.find()
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
      res.send(users)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener usuarios', error: error.message })
    }
  },

  async getLoggedUser(req, res) {
    try {
      const user = await User.aggregate([
        { $match: { _id: req.user._id } },
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $addFields: {
            followerCount: { $size: "$followers" },
          },
        },
      ])

      if (!user.length) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }

      res.send(user[0])
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al mostrar la información del usuario conectado', error: error.message })
    }
  },

  async getByName(req, res) {
    try {
      const filters = {}
      if (req.params.name) {
        filters.username = { $regex: req.params.name.toLowerCase(), $options: 'i' }
      }
      const user = await User.findOne(filters)
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }
      res.status(200).send(user)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener usuario', error: error.message })
    }
  },

  async getById(req, res) {
    try {
      const user = await User.findById(req.params._id)
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }
      res.status(200).send(user)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener usuario', error: error.message })
    }
  },

  // followUser
async followUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    if (!userId || userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!currentUser.follows.includes(userId)) {
      currentUser.follows.push(userId);
      await currentUser.save();
    }

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.json({ user: currentUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al seguir al usuario' });
  }
},

// unfollowUser
async unfollowUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    if (!userId || userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes dejar de seguirte a ti mismo' });
    }

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    currentUser.follows = currentUser.follows.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ user: currentUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al dejar de seguir al usuario' });
  }
},

  
}

module.exports = UserController
