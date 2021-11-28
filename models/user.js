const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const UnauthorizedError = require('../errors/unauthorized-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        return /https?:\/\/(www\.)?[-a-zA-Z0-9]{2,256}\.[a-z]{1,6}([-a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=\S]*)/g.test(v);
      },
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function validate(email) {
        return validator.isEmail(email);
      },
      message: 'Введён некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          return user;
        });
    })
    .catch(next);
};

module.exports = mongoose.model('user', userSchema);
