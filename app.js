const express = require('express'); 
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const { PORT=3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  useUnifiedTopology: true 
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '618cd1278023e2aa7dff2ed7'
  };
  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})