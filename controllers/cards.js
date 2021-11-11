const Card = require('../models/card');

const getCards = (req, res) => Card.find({})
  .then((cards) => {
    if (cards.length === 0) {
      res.status(404).send({ message: 'Карточки не найдены' });
      return;
    }
    res.send(cards);
  })
  .catch((err) => res.status(500).send(`Ошибка: ${err.code}${err.message}`));

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(404).send({ message: `Введены некорректные данные: ${err}` });
        return;
      }
      res.status(500).send(`Ошибка: ${err.code}${err.message}`);
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (!card) {
      res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
    }
    res.send(card);
  })
  .catch((err) => res.status(500).send(`Ошибка: ${err.code}${err.message}`));

const likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .then((likes) => {
    if (!likes) {
      res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
    }
    res.send(likes);
  })
  .catch((err) => res.status(500).send(`Ошибка: ${err.code}${err.message}`));

const dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
  .then((likes) => {
    if (!likes) {
      res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
    }
    res.send(likes);
  })
  .catch((err) => res.status(500).send(`Ошибка: ${err.code}${err.message}`));

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
