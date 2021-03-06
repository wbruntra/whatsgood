var express = require('express');
var router = express.Router();
var config = require('../config')();
var oauth2 = require('../lib/oauth2')(config.oauth2);

var Location = require('../models/location');

router.use(oauth2.aware);
router.use(oauth2.template);

/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log(req.session);
  try {
    console.log(req.session.profile.id);
  }
  catch(e) {
    console.log('no profile right now');
  }
  var categories = {"guis":"Tacos de Guisado",
                    "tortas": "Tortas",
                    'hamburgers': "Hamburgers",
                    'comida':"Comida Corrida",
                    "tacos":"Tacos",
                    "quesadillas":"Quesadillas",
                    'other':"Other"};
  Location.find(function(err, recentLocations) {
    res.render('index', { title: 'WhatsGood', locations: recentLocations, categories: categories });
  });
});

/* GET saved locations */
router.get('/locations', function(req, res) {
  Location.find(function( err, locations) {
    res.render('locationList', { title: 'Saved Locations', locations : locations});
    // if (err)
    //   res.send(err);
    // res.json(locations);
  });
});

router.post('/addlocation', function(req,res) {
  var newLocation = req.body;
  var username = req.session.username;
  if (!username) {
    username = 'Anonymous';
  }
  newLocation['createdBy'] = username;
  newLocation['creatorId'] = req.session.profile.id;
  location = new Location(newLocation);
  location.save(function(err) {
    if (err)
      res.send(err);

    res.json(location);
  });
});

router.post('/editlocation', function(req,res) {
  var newLocation = req.body;
  console.log(newLocation);
  var username = req.session.username;
  newLocation['createdBy'] = username;
  newLocation['creatorId'] = req.session.profile.id;
  Location.findOne({_id: req.body.locationId}, function(err, location) {
    location.name = newLocation.name;
    location.price = newLocation.price;
    location.category = newLocation.category;
    location.description = newLocation.description;
    if (req.session.profile.id == location.creatorId) {
      location.save(function(err) {
        if (err)
          res.send(err);
        else {
          res.json(location);
        }
      });
  }
  });
});



router.post('/inview', function(req,res) {
  var north = req.body.north;
  var south = req.body.south;
  var west = req.body.west;
  var east = req.body.east;
  Location.find( {"lat": {$gt: south,
                          $lt: north},
                  "lng": {$gt: west,
                          $lt: east}
                }, function(err, locations) {
                  console.log(err);
                 console.log(JSON.stringify(locations));
                 res.json(locations);
               });
});

router.post('/mylocations', function(req,res) {
  var user_id = req.session.profile.id;
  Location.find({creatorId: user_id}, function(err, locations) {
    res.json(locations);
  });
});

router.get('/migrate', function(req,res) {
  Location.find(function(err, locations) {
    for (var i=0;i<locations.length;i++) {
      var location = locations[i];
      var center = location.center;
      console.log(center);
      var lat = parseFloat(center.split(',')[0]);
      var lng = parseFloat(center.split(',')[1]);
      console.log(lng);
      location['lat'] = lat;
      location['lng'] = lng;
      location.save(function(err) {
        if (err)
          {res.send(err)}
        // else {
        //   // res.json(location);
        // }
      });
    }
  });
});

module.exports = router;
