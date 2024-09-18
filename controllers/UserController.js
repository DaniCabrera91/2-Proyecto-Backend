const cloudinary = require('../config/cloudinaryConfig');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const upload = require('../middlewares/multerConfig');
require('dotenv').config();

const UserController = {
  uploadImage: upload.single('profileImage'),

// UserController.js
async register(req, res, next) {
  try {
    const { firstName, username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    let profileImageUrl = 'https://res.cloudinary.com/dyt3uvyo7/image/upload/v1726674676/sfi2eyie8qwb9qd4xoli.jpg';
    
    if (req.file) {
      // Aquí ya no necesitas subir la imagen a Cloudinary, multer lo hará
      profileImageUrl = req.file.path;
    }

    const user = await User.create({
      firstName,
      username,
      email,
      password: passwordHash,
      profileImageUrl,
      role: 'user',
    });

    res.status(201).send({ message: "Usuario registrado con éxito", user });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},


async updateUser(req, res, next) {
  try {
    if (req.body.password) {
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      req.body.password = passwordHash;
    }
    let updateData = { ...req.body };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.profileImageUrl = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(
      req.params._id,
      updateData,
      { new: true }
    );
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }
    res.send({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},


  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ message: 'Contraseña incorrecta.' });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      user.tokens.push(token);
      await user.save();

      res.send({ message: 'Inicio de sesión exitoso', user, token });
    } catch (error) {
      res.status(500).send({ message: 'Error al iniciar sesión', error });
    }
  },

  async logout(req, res) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: req.headers.authorization },
      });
      res.send({ message: 'Desconectado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: 'Hubo un problema al intentar desconectar al usuario',
      });
    }
  },

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await User.find()
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      res.send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener usuarios' });
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
      ]);

      if (!user.length) {
        return res.status(404).send({ message: 'Usuario no encontrado' });
      }

      res.send(user[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'Error al mostrar la información del usuario conectado' });
    }
  },

  async getByName(req, res) {
    try {
      const filters = {};
      if (req.params.name) {
        filters.username = { $regex: req.params.name.toLowerCase(), $options: 'i' };
      }
      const user = await User.findOne(filters);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' });
      }
      res.status(200).send(user);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener usuario' });
    }
  },

  async getById(req, res) {
    try {
      const user = await User.findById(req.params._id);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' });
      }
      res.status(200).send(user);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al obtener usuario' });
    }
  },

  async follow(req, res) {
    try {
      if (`${req.params.id}` === `${req.user._id}`) {
        return res.status(400).send('No puedes seguirte a ti mismo...');
      }

      await User.findByIdAndUpdate(req.params.id, 
        { $push: { followers: req.user._id }},
        { new: true }
      );
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { follows: req.params.id } },
        { new: true }
      );
      res.status(201).send({ message: 'Usuario seguido con éxito', user });
    } catch (error) {
      console.error(error);
      res.status(400).send('Problema al seguir usuario');
    }
  },

  async unfollow(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user._id },
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { follows: req.params.id } },
        { new: true }
      );

      res.status(201).send({ message: 'Usuario dejado de seguir con éxito', user });
    } catch (error) {
      res.status(400).send('Problema al dejar de seguir usuario');
    }
  },
};

module.exports = UserController;
