var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require("./models/user");

var helmet = require('helmet');
var validator = require("express-validator");


var passport = require("passport");
var passportConfig = require("./config/passport");
passportConfig(passport);
require("./config/database");


var routes = require('./routes/index');
var users = require('./routes/users');
var apiUser = require('./routes/apiUser');
var apiAdmin = require('./routes/apiAdmin');

var app = express();
/*
 This turns on ALL security features found in helmet
 See: https://www.npmjs.com/package/helmet
 For information related to using only individual pieces
 */
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(validator());// this line MUST be immediately after express.bodyParser()!

app.use(cookieParser());


/*
 Force https on OPENSHIFT
 Important: This has to come before "app.use(express.static(path.join(__dirname, 'public')));" in order to handle static files
*/
app.use("/",function (req, res, next) {
  if ( req.headers['x-forwarded-proto'] === 'http' ) {
    var tmp= 'https://'+req.headers.host+req.originalUrl;
    res.redirect(tmp);
  } else {
    return next();
  }
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', function (req, res, next) {

  passport.authenticate('jwt', {session: false}, function (err, user, info) {
    console.log("err: " + err);
    console.log("User: " + user);
    console.log("Info: " + info);
    if (err) {
      return next({ code: 403, message: 'Token could not be authenticated'});
    }
    if (user) {
      req.authenticatedWithRoles = user.roles;
      return next();
    }
    return next({ code: 403, message: 'Token could not be authenticated'});
})(req, res, next);
});

app.use(passport.initialize());


app.get('/auth/facebook', passport.authenticate('facebook', {session: false, scope: ['email']}));

app.get('/auth/facebook/callback', function (req, res, next) {
  passport.authenticate('facebook', {session: false, failureRedirect: "/"}, function (err, token, info) {
      if (err) {
        return res.redirect("/?error=CouldNotAuthenticate");
      }
      if (token) {
        return res.redirect("/?token=" + token);
      }
    }
  )(req, res, next);
});


app.use('/', routes);
app.use('/users', users);
app.use('/api/userrole', apiUser);
app.use('/api/adminrole', apiAdmin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Handle API Errors
app.use(function (err, req, res, next) {
  if(err.code) {
    res.status(err.code);
    return res.json({error: err});
  }
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
