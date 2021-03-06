'use strict';

var express = require('express');
var garouter = express.Router()

var google = require('googleapis');
var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;
var jsonfile = require('jsonfile');
var path = require('path')
var key = require('../private/dashboard-9ffb13a69a61.json')
var reports = require('./reports.json')
var scopes = ["https://www.google.com/analytics/feeds"]
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);
var stathat = require('stathat');

var d3 = require('d3');
//
// LokiJS is a high-performance in-memory document database which prioritise performance over anything.
//

var loki = require('lokijs');
var db = new loki("public/data/rtdb.json", {
    'autoload' : true,
    'autosave' : true,
    'verbose' : true  });
var rtdb = db.addCollection("rtdb");

var counter = 0;
var countlev = 0;

  var analyticProfiles = [
  //    "ga:78449289",
      "ga:95726205",
      "ga:78449289",
      "ga:95719958"
    ];


function queryAllRealtime(analytics, reports) {

// TODO: Check if realtime or not.
//



  counter = counter -1;
  console.log("Counter was reduced by one and is now " + counter)
  reports["reports"].forEach(function(query){

  
    if(counter <= 0){  
      // Prepare a query object.
      var shuffleResult = d3.shuffle(analyticProfiles);
      var a = query["query"];
      a.auth = jwtClient;
      a.ids = analyticProfiles[0];
      console.log("Requesting using profile " + analyticProfiles[0] + "The current list is" + JSON.stringify(analyticProfiles) + " the shuffle result was " + shuffleResult);

      analytics.data.realtime.get(a,function(err, response){
        if(err){
          console.log(err);
          // BACKOFF STRATEGY. WE NEED TO STOP QUERIES FOR A WHILE.
          countlev = countlev + 1;
          if(countlev >= 40) {
            countlev = 40;
          }
          counter = countlev;
          stathat.trackEZCount("mail@tovare.com", "GA Failed", 1, function(status, json) {});
          console.log("FAILED ATTEMPT. COUNTER IS " + counter);
          return;
        }
        countlev = 1;
        counter = 1;

          var doc = rtdb.findOne({'name': query.name });
          if(!doc){
              doc = rtdb.insert({ "name" : query.name } );
          }
          doc.response = response;
          console.log(response)
          rtdb.update(doc);
          stathat.trackEZCount("mail@tovare.com", "GA Updated", 1, function(status, json) {});
      });
    }
  });
}


//
// Authorize client. This is done on startup, but it might be necessary to do this more often.
//
jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
  queryAllRealtime(analytics,reports);
  d3.interval( function() { queryAllRealtime(analytics,reports) }, 15000);

  
});


// REQUEST HANDLING CODE
// -------------------------------------------------------------
// All of the data is memory resident. The request methods retrieve 
// data from the Loki database.
//


garouter.get('/rtusers', function(req, res) {
    var rtusers = rtdb.findOne( { 'name': 'brukere-realtime' })
    res.json(rtusers.response.totalsForAllResults);
    
    console.log("Request rtusers");
})

garouter.get('/rtgeo', function(req, res) {
    var rtgeo = rtdb.findOne( { 'name': 'brukere-geo-realtime' })
    res.json(rtgeo.response.rows)
      console.log("Request rtusers");
})

garouter.get('/rtdevices', function(req, res) {
  var redevices = rtdb.findOne( { 'name': 'brukere-device-realtime' });
  res.json(redevices.response.rows);
  console.log("Request rtdevices");
})

module.exports = garouter