var express = require('express');
var router = express.Router();
var config = require('../config')();
var oauth2 = require('../lib/oauth2')(config.oauth2);

var Location = require('../models/location');
var User = require('../models/user');


var cats =   {"Tacos de Guisado":"guis",
  "Tortas":"tortas",
  "Hamburgers":"hamburgers",
  "Comida Corrida":"comida",
  "Tacos":"tacos",
  "Quesadillas":"quesadillas",
  "Other":"other"};

router.use(oauth2.aware);
router.use(oauth2.template);

/* GET saved locations */
router.get('/', function(req, res) {
  Location.find(function( err, locations) {
    res.render('locationList', { title: 'Saved Locations', locations : locations});
    // if (err)
    //   res.send(err);
    // res.json(locations);
  });
});

router.get('/json',function(req,res) {
  Location.find(function(err,locations) {
    res.json(locations);
  });
});

router.post('/add', function(req,res) {
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

router.post('/android', function(req, res) {
  var newLocation = req.body;
  var userId = req.body.creatorId;
  newLocation['category'] = cats[newLocation['category']];
  User.findOne({_id:userId},function(err,user) {
    newLocation['createdBy'] = user.username;
    location = new Location(newLocation);
    console.log(JSON.stringify(location));
    // res.json({msg:""});
    location.save(function(err) {
      if (err) {
        res.json({msg:"ERR"});
      }
      else {

      res.json({msg:"OK"});
    }
    });
  });
});

router.post('/edit', function(req,res) {
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

router.post('/delete', function(req,res) {
  var locationId = req.body.locationId;
  console.log(locationId);
  Location.remove({_id:locationId},function(err,location) {
    res.send('DELETED');
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

module.exports = router;
