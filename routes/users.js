const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUser,
  updateUserInfo,
  updateUserAvatar,
  getCurrentUserInfo,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getCurrentUserInfo);
router.get(
  '/users/:userId',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().required().hex().length(24),
    }),
  }),
  getUser,
);
router.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateUserInfo,
);
router.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required()
        .regex(/^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/),
    }),
  }),
  updateUserAvatar,
);

module.exports = router;
