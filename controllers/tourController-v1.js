const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

// ROUTE HANDLERS
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
  const tour = tours.find((item) => item.id === Number(req.params.id));

  res.status(200).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour,
    },
  });
}

function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { ...req.body, id: newId };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
  const tour = tours.find((item) => item.id === Number(req.params.id));

  res.status(200).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour: '<p>updated tour here...</>',
    },
  });
}

function deleteTour(req, res) {
  const tour = tours.find((item) => item.id === Number(req.params.id));

  res.status(204).json({
    status: 'successs',
    results: tour.length,
    data: {
      tour: null,
    },
  });
}

function checkID(req, res, next, val) {
  const tour = tours.find((item) => item.id === Number(val));

  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  next();
}
function checkBody(req, res, next) {
  console.log(req.body);
  if (!req.body.name || !req.body.price)
    return res
      .status(400)
      .json({ status: 'fail', message: 'Missing name or price' });
  next();
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
};
