const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-error');
const ConflictingRequestError = require('../errors/conflicting-request-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET = 'my-super-secret-key' } = process.env;

const getUsers = (req, res, next) => User.find({})
  .then((users) => {
    res.send(users);
  })
  .catch(next);

const getUser = (req, res, next) => User.findById(req.params.userId)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }
    res.send(user);
  })
  .catch((err) => {
    if (err.statusCode === 404 || err.statusCode === 403) {
      throw err;
    }
    if (err.name === 'CastError') {
      throw new BadRequestError('Невалидный id');
    }
  })
  .catch(next);

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((mail) => {
      if (mail) {
        throw new ConflictingRequestError('Пользователь с таким email уже зарегистрирован');
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            name, about, avatar, email, password: hash,
          })
            .then((user) => res
              .status(201)
              .send({
                data: {
                  email: user.email,
                  about: user.about,
                  name: user.name,
                  avatar: user.avatar,
                  _id: user._id,
                },
              }))
            .catch((err) => {
              if (err.name === 'ValidationError') {
                throw new BadRequestError('Введены некорректные данные');
              }
            })
            .catch(next);
        });
      return true;
    })
    .catch(next);
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Введены некорректные данные');
      }
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Введены некорректные данные');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        httpOnly: true,
      })
        .status(200).send({ message: 'Вы успешно авторизовались' });
    })
    .catch(() => {
      throw new UnauthorizedError('Необходима авторизация');
    })
    .catch(next);
};

const getCurrentUserInfo = (req, res, next) => {
  const userId = req.user._id;
  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Невалидный id');
      }
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
  getCurrentUserInfo,
};
