var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');

var User = require('../models/user');
var Location = require('../models/location');

/* GET users listing. */

router.get('/register', function(req, res, next){
  res.render('signup', {err:null});
});

router.post('/register', function(req, res, next){
  var username = req.body.username;
  if (!username) {
    username = req.session.profile.displayName;
  }
  var user = new User({
    _id: req.session.profile.id,
    name: req.session.profile.displayName,
    username: username
  });
  user.save(function(err) {
    if (err) {
      res.render('signup',{err:"Nickname already taken"});
    }
    else {
      req.session.username = username;
      res.redirect('/');
    }
  });
});

router.post('/edit', function(req, res, next) {
  var username = req.body.username.trim();
  if (!username) {
    res.json({msg: "no changes made"});
  } else {
  User.findOne({_id: req.session.profile.id}, function(err, user) {
    user.username = username;
    user.save(function(err) {
      if (err) {
        res.json({msg: "Couldn't save!"});
      }
      else {
        req.session.username = username;
        res.json({msg: "Saved"});
      }
    });
  });
  }
});

router.get('/myprofile', function(req,res,next) {
  var user_id = req.session.profile.id;
  console.log(user_id);
  Location.find({creatorId: user_id}, function(err, locations) {
    res.render('profile',{locations: locations});
  });
});

router.get('/', function(req, res, next) {
  User.find(function(err,users) {
    if (err)
      res.send(err);
    res.json(users);
  });
});

router.get('/logout', function(req,res) {
  delete req.session.username;
  res.redirect('/');
});

router.post('/login', function(req, res) {
  username = req.body.username;
  password = req.body.password;
  User.findOne({username: username}, function(err, user) {
    if (err) {
      res.json({err: 'An Error Occurred.'});
    } else {
      if (!user) {
        res.json({err:'No user found by that name.'});
      }
      else {
        user.verifyPassword(password, function(err, isMatch) {
          if (!isMatch) {
            res.json({err:'Wrong password'});
          }
          else {
            req.session.username = username;
            res.json({err:null});
          }
        });
      }
    }
  });
});

router.post('/signup', function(req,res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });

  user.save(function(err) {
    if (err) {
      res.json({err: 'Username already taken'});
    } else {
      req.session.username = user.username;
      res.json({err: null});
    }
  });
});

module.exports = router;
