var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
  local: {
    userName: {type: String, unique: true,default: null},
    password: {type: String, default: null}
  },
  roles: [],
  facebook: {
    id: String,
    email: String,
    name: String
  }
});
//},{ safe: true });

UserSchema.pre("save",function(next){
  var user = this;
  if(!user.local.password){
    return next();
  }
  if (this.isModified('local.password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.local.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.local.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function(passw,callback){
  bcrypt.compare(passw,this.local.password, function (err, isMatch) {
    if(err){
      return callback(err);
    }
    callback(null,isMatch);
  });
};


module.exports = mongoose.model("User",UserSchema);

