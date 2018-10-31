// Google Analytics
// ----------------
// Accessing the google analytics reporting API and intended for batch-processing.
// 
'use strict';

var google = require('googleapis');
var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;
var jsonfile = require('jsonfile');
var path = require('path')
var key = require('../private/dashboard-9ffb13a69a61.json')
var reports = require('./reports.json')

var scopes = ["https://www.google.com/analytics/feeds"]

var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);

console.log("Expires : " + JSON.stringify(jwtClient));

var d3 = require('d3');


var loki = require('lokijs');
var db = new loki("testdb.json", {
    'autoload' : true,
    'autosave' : true,
    'verbose' : true  });
var rtdb = db.addCollection("testdb");



/*
 * ga:pageTitle
 * ga:pagePath
 */

function queryData(analytics, callback) {
      analytics.data.realtime.get({
        'auth': jwtClient,
        'ids': 'ga:78449289',
        'metrics': 'rt:activeUsers',
        'dimensions': 'rt:deviceCategory,rt:browser,rt:operatingSystem'
      }, function (err, response) {
          if (err) {
            console.log(err);
            return;
          }
          console.log("ok1")
          // oppdater databasen
          var doc = rtdb.findOne({'name': "rttest" });
          if(!doc){
              console.log("ok2")
              doc = rtdb.insert({ "name" : "rttest" } );
          }
          console.log("ok3")
          doc.response = response.rows;
          console.log("ok4")
          rtdb.update(doc);
          console.log("ok5")
          return callback();
      });  
}
  
          
        // jsonfile.writeFile(path.resolve(__dirname,'realtime.json'), response.rows, {spaces: 2},function (err) {
        //if(err) console.error(err)
        //})

function queryAllRealtime(analytics, reports) {
  reports["reports"].forEach(function(query){
    // Prepare a query object.
    var a = query["query"];
    a.auth = jwtClient;
    a.ids = 'ga:78449289';
  
  
    analytics.data.realtime.get(a,function(err, response){
      if(err){
        console.log(err);
        return;
      }

      console.log(path.resolve(__dirname, '../public/data/', query.name+".json") )
      jsonfile.writeFile(path.resolve(__dirname,'../public/data/', query.name+".json"), response, {spaces: 2}, function (err) {
        if (err) console.error(err);
      })
    })
  })
}


jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  }

  //queryAllRealtime(analytics,reports);
  queryData(analytics, function() {
    var doc = rtdb.findOne({'name': "rttest" });
    console.log(doc)

    // Calculate device types
    var dt = d3.nest()
       .key( function(d) {
           return d[0]
         })
       .rollup( function(v) {
         return  d3.sum(v, function(o) {return o[3] })
        }).object(doc.response)
    console.log(dt)

    // Calculate browsers
    var br = d3.nest()
       .key( function(d) {
           return d[1]
         })
       .rollup( function(v) {
         return  d3.sum(v, function(o) {return o[3] })
        }).object(doc.response)
    console.log(br)

    var os = d3.nest()
       .key( function(d) {
           return d[2]
         })
       .rollup( function(v) {
         return  d3.sum(v, function(o) {return o[3] })
        }).object(doc.response)
    console.log(os)
    
    
  })

});
