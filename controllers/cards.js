const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

const getCards = (req, res, next) => Card.find({})
  .then((cards) => {
    res.send(cards);
  })
  .catch(next);

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Введены некорректные данные');
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      if (userId !== card.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять карточки других пользователей');
      }
      Card.findByIdAndDelete(req.params.cardId)
        .then((data) => res.send(data))
        .catch(next);
    })
    .catch(next);
};

const likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .then((likes) => {
    if (!likes) {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    }
    res.send(likes);
  })
  .catch(next);

const dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
  .then((likes) => {
    if (!likes) {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    }
    res.send(likes);
  })
  .catch(next);

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
