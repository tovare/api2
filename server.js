
// The main program for the API
// ============================
//
// The API is based on express 4 which has a fairly flexible router which allows
// for a more modular design organized in router specific middleware for main
// routes.
//

var express = require('express');


var app = express();
var router = express.Router();

app.use('/apiv2',router);
app.use('/apiv2/ga', express.static(__dirname+'/public/data') );


router.get('/',function(req,res) {
  res.send('documentation');
})


// always invoked
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//
// A proxy forward is defined in the nginx configuration for requests to /apiv2
// this gives me HTTP/2 and HTTPS support. Requests over https and authenticationn for 
// external servies are the only network requirement for this server application.
//
app.listen(3000, function () {
  console.log('APIv2 listening on port 3000!');
});