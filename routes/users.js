var express = require('express');
var router = express.Router();
var User = require("mongoose").model("User");
var jwt = require("jwt-simple");
const jwtConfig = require("../config/jwtConfig").jwtConfig;

// create a new user account (POST http://localhost:8080/api/signup)
router.post('/signup', function(req, res,next) {
  console.log(req.body);
  if (!req.body.userName || !req.body.password) {
    res.status(400);
    return next({ code: 400, message: 'provide a Username and a Password'});
  } else {
    var newUser = new User({
      local: {
        userName: req.body.userName,
        password: req.body.password
      },
      roles : ["user"]
    });
    // save the user

    newUser.save(function(err) {
      if (err) {
        res.status(400);
        return next({ code: 400, message: 'UserName already existed'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/authenticate', function(req, res, next) {
  console.log(req.body);
  User.findOne({
    "local.userName": req.body.userName
  }, function (err, user) {
    if (err) throw err;

    if (!user) {

     next({ code: 401, message: 'Login failed. Wrong user name or password'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var iat = new Date().getTime()/1000;  //convert to seconds
          var exp = iat+jwtConfig.tokenExpirationTime;
          var payload = {
            aud: jwtConfig.audience,
            iss:  jwtConfig.issuer,
            iat: iat,
            exp: exp,
            sub: user.local.userName,
            roles : user.roles
          }
          var token = jwt.encode(payload, jwtConfig.secret);
          // return the information including token as JSON
          res.json({token: token});
        } else {
          next({ code: 401, message: 'Login failed. Wrong user name or password'});
        }
      });
    }
  });
});

module.exports = router;
