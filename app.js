const express = require('express');
const { DataTypes, Sequelize } = require('sequelize');
const bodyParser = require('body-parser');

// Configuration de sequelize
const dbConfig = {
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql',
  database: 'sequelize',
};

// Création de l'objet sequelize
const orm = new Sequelize(dbConfig);

// Création d'un modèle
const Person = orm.define('person', {
  personName: { type: DataTypes.STRING(50) },
  firstName: { type: DataTypes.STRING(50) },
});

const Task = orm.define('task', {
  taskName: { type: DataTypes.STRING(80) },
  dueDate: { type: DataTypes.DATE },
  done: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes pour l'API task

app.get('/task', async (req, res) => {
  const taskList = await Task.findAll();
  res.status(200).json(taskList);
});

app.get('/task/:id([0-9]+)', async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  res.status(200).json(task);
});

app.post('/task', async (req, res) => {
  const task = await Task.create({
    taskName: req.body.taskName,
    dueDate: new Date(req.body.dueDate),
  });
  await task.save();
  res.status(200).json(task);
});

app.delete('/task/:id([0-9]+)', async (req, res) => {
  await Task.destroy({ where: { id: req.params.id } });
  res.redirect('/task');
});

app.put('/task/:id([0-9]+)', async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (req.body.done) task.done = req.body.done;
  if (req.body.taskName) task.taskName = req.body.taskName;
  if (req.body.dueDate) task.dueDate = new Date(req.body.dueDate);

  await task.save();

  res.status(200).json(task);
});

app.post('/person', async (req, res) => {
  // Création d'un modèle
  const newPerson = await Person.create(req.body);
  // Sauvegarde du modèle
  await newPerson.save();
  res.status(200).json(newPerson);
});

app.get('/person', async (req, res) => {
  const personList = await Person.findAll();
  res.status(200).json(personList);
});

app.get('/person/:id([0-9]+)', async (req, res) => {
  const person = await Person.findByPk(req.params.id);
  res.status(200).json(person);
});

app.put('/person/:id([0-9]+)', async (req, res) => {
  const person = await Person.findByPk(req.params.id);
  if (req.body.firstName) person.firstName = req.body.firstName;
  if (req.body.personName) person.personName = req.body.personName;

  await person.save();

  res.status(200).json(person);
});

app.delete('/person/:id([0-9]+)', async (req, res) => {
  await Person.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.redirect('/person');
});

app.get('/test', async (req, res) => {
  try {
    // synchronisation de la BD avec les modèles
    await orm.sync({ force: true });

    // Création d'une personne
    const tycho = await Person.create({
      personName: 'Brahé',
      firstName: 'Tycho',
    });
    console.log(tycho);
    await tycho.save();

    // test de la connexion
    await orm.authenticate();
    res.status(200).end('ok');
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(3000, async () => {
  console.log('app started');
  // synchronisation de la BD avec les modèles
  await orm.sync();
});
