var JwtStrategy = require("passport-jwt").Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require("jwt-simple");
var configAuth = require('./auth');

var User = require("mongoose").model("User");
var jwtConfig = require("../config/jwtConfig").jwtConfig;


module.exports = function (passport) {

  var opts = {};
  opts.secretOrKey = jwtConfig.secret;
  opts.issuer = jwtConfig.issuer;
  opts.audience = jwtConfig.audience;
  //opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("Bearer");
  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    console.log("PAYLOAD: " + JSON.stringify(jwt_payload));
    //For long lived tokens we should check whether the user still exists
    //User.findOne({"local.userName": jwt_payload.sub}, {userName:1, roles:1, _id: 0},function(err,user){
    //  if(err){
    //    return done(err,false);
    //  }
    //  if(user){
    //    console.log("User:"+ user);
    //    done(null,user);
    //  }
    //  else{
    //    done(null,false,"User found in token, not found");
    //  }
    //})
    done(null, jwt_payload);
  }));

  passport.use(new FacebookStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      profileFields: configAuth.facebookAuth.profileFields

    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        console.log(profile);
        User.findOne({'facebook.id': profile.id}, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            var token = makeToken(user);
            //return done(null, user);
            return done(null, token);
          }
          else {
            try {
              var newUser = new User();
              newUser.facebook.id = profile.id;
              newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.email = profile.emails[0].value;
              newUser.roles = ["user"];
              console.log("SAVING");
              newUser.save(function (err) {
                if (err) {
                  return done(err);
                }
                var token = makeToken(newUser);
                return done(null, token);
              })


            } catch (err) {
              done(err);
            }
            done(null, null);
          }
        });
      });
    }
  ));
  function makeToken(user) {
    var iat = new Date().getTime() / 1000;  //convert to seconds
    var exp = iat + jwtConfig.tokenExpirationTime;
    var payload = {
      aud: jwtConfig.audience,
      iss: jwtConfig.issuer,
      iat: iat,
      exp: exp,
      sub: user.facebook.email,
      roles: user.roles
    }
    var token = jwt.encode(payload, jwtConfig.secret);
    return token;
  }

};
