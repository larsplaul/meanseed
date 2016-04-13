var express = require("express");
var router = express.Router();

//IMPORTANT! Place all routes requiring the "admin" role BELOW this middleware
router.use(function(req,res,next){
  var role = req.authenticatedWithRoles.filter(function (role) {
    return role === "admin";
  })
  if (role.length === 1) {
    return next();
  }
  //THIS does not work on OPENSHIFT
  //if(req.authenticatedWithRoles){
  //  if(req.authenticatedWithRoles.find(function(role){
  //      return role === "admin";
  //    })){
  //    return next();
  //  }
  //}
  res.status(403).json({error: {code: 403, message : "Not authorized"}})
})


router.get("/hellos",function(req,res){
  res.json([{msg: "Hello World" }, {msg: "Hello all"},{msg: "Hello guys"}]);
})

module.exports = router;