var express = require("express");
var router = express.Router();

//IMPORTANT! Place all routes requiring the "user" role BELOW this middleware
router.use(function (req, res, next) {
  if (req.authenticatedWithRoles) {
    var role = req.authenticatedWithRoles.filter(function (role) {
      return role === "user";
    })
    if (role.length === 1) {
      return next();
    }
    //Does not work with OPENSHIFT
    //if(req.authenticatedWithRoles.find(function(role){
    //    return role === "user";
    //  })){
    //
    //  return next();
    //}
  }
  res.status(403).json({error: {code: 403, message: "Not authorized"}})
})

router.get("/names", function (req, res) {
  res.json([{name: "Peter"}, {name: "Kurt"}, {name: "Hanne"}]);
})


module.exports = router;