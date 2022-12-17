const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { body, validationResult } = require('express-validator');
const app = express();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '#local0x#',
  database: 'postgres',
});

const User = sequelize.define(
  'User',
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: 'users' }
);

app.use(express.json());

app.post(
  '/info',
  body('firstName')
    .isString()
    .withMessage({
      message: 'First name must be a string',
      status: 400,
    })
    .trim()
    .escape()
    .notEmpty()
    .matches(/^[A-Za-z0-9 ]+$/),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { firstName } = req.body;

    await User.sync({ force: true });
    await User.create({ firstName });
    res.status(201).send();
  }
);

app.get('/info', async (req, res) => {
  const users = await User.findAll();
  res.send({ users });
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
