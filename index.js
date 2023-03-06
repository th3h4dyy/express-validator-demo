const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { body, validationResult } = require('express-validator');
const app = express();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'lol0x',
  database: 'postgres',
});

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
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

app.post('/login', async (req, res) => {
  await User.sync({ force: true });
  await User.create({ username: 'admin', password: 'test123' });
  const { username, password } = req.body;
  /**
   * my malicious query
   * {
      "username": "admin",
      "password": "' or 1=1--"
      }
   */
  const result = await sequelize.query(
    `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
  );

  if (result[0].length === 0) {
    return res.status(401).send();
  }
  res.status(200).send({ result: result[0] });
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
