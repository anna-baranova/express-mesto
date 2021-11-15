const User = require('../models/user');

const getUsers = (req, res) => User.find({})
  .then((users) => {
    res.send(users);
  })
  .catch((err) => res.status(500).send({ message: `Ошибка: ${err.code}${err.message}` }));

const getUser = (req, res) => User.findById(req.params.userId)
  .then((user) => {
    if (!user) {
      res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      return;
    }
    res.send(user);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Невалидный id ' });
    }
    res.status(500).send({ message: `Ошибка: ${err.code}${err.message}` });
  });

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Введены некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка: ${err.code}${err.message}` });
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Введены некорректные данные: ${err}` });
      }
      res.status(500).send({ message: `Ошибка: ${err.code}${err.message}` });
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Введены некорректные данные: ${err}` });
      }
      res.status(500).send({ message: `Ошибка: ${err.code}${err.message}` });
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
};
