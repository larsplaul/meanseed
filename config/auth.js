var url = "http://localhost:3000/auth/facebook/callback";

var clientID = '592994014198685';
var clientSecret = "a277391a2c02039263f057cccfe5ecb2";

if(process.env.OPENSHIFT_NODEJS_IP){
  clientID = '1071238286271709';
  clientSecret = "7ad836bc537f214b58a65954df4b9353";
  url = "/auth/facebook/callback";
}

console.log("###### URL ##########: "+url);

module.exports = {
  facebookAuth : {
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: url,
    profileFields: ['id', 'emails', 'name','verified']
  }
}


