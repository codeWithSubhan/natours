const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// MIDDLEWARE
app.use(morgan('dev')); //middleWare btw req and res
app.use(express.json()); //middleWare btw req and res

app.use((req, res, next) => {
  //middleWare btw req and res
  console.log('Hello!. from middle ware');
  next();
});

app.use((req, res, next) => {
  req.requstTime = new Date().toLocaleString();
  next();
});

const port = 3000;
const BASE_API = '/api/v1/tours';
const BASE_API1 = '/api/v1/users';

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side! 😀', author: 'subhan' });
// });

// app.post('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side! 😀', author: 'subhan' });
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// ROUT HANDLERS
function getAllTours(req, res) {
  res.status(200).json({
    status: 'successs',
    requestedAt: req.requstTime,
    results: tours.length,
    data: {
      tours,
    },
  });
}

function getTour(req, res) {
  console.log(req.params);
  const id = Number(req.params.id);
  const tour = tours.find((item) => item.id === id);

  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });

  res.status(200).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour,
    },
  });
}

// app.get(BASE_API + '/:id/:x?/:y?', (req, res) => {

function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { ...req.body, id: newId };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'successs',
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );
}

function updateTour(req, res) {
  console.log(req.params);
  const id = Number(req.params.id);
  const tour = tours.find((item) => item.id === id);

  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });

  res.status(200).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour: '<p>updated tour here...</>',
    },
  });
}

function deleteTour(req, res) {
  console.log(req.params);
  const id = Number(req.params.id);
  const tour = tours.find((item) => item.id === id);

  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });

  res.status(204).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour: null,
    },
  });
}

function getAllUsers(req, res) {
  res.status(500).json({
    status: 'Error',
    message: 'Routes is not defined yet',
  });
}
function createUser(req, res) {
  res.status(500).json({
    status: 'Error',
    message: 'Routes is not defined yet',
  });
}
function getUser(req, res) {
  res.status(500).json({
    status: 'Error',
    message: 'Routes is not defined yet',
  });
}
function updateUser(req, res) {
  res.status(500).json({
    status: 'Error',
    message: 'Routes is not defined yet',
  });
}
function deleteUser(req, res) {
  res.status(500).json({
    status: 'Error',
    message: 'Routes is not defined yet',
  });
}

// ROUTES
// app.get(BASE_API, getAllTours);
// app.get(BASE_API + '/:id', getTour);
// app.post(BASE_API, createTour);
// app.patch(BASE_API + '/:id', updateTour);
// app.delete(BASE_API + '/:id', deleteTour);

// app.route(`${BASE_API}`).get(getAllTours).post(createTour);
// app.route(`${BASE_API}/:id`).get(getTour).patch(updateTour).delete(deleteTour);

// app.route(`${BASE_API1}`).get(getAllUsers).post(createUser);
// app.route(`${BASE_API1}/:id`).get(getUser).patch(updateUser).delete(deleteUser);

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// START SERVER
app.listen(port, () =>
  console.log(`App running on port http://localhost:${port}`)
);
