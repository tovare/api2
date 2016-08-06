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

/*
 * ga:pageTitle
 * ga:pagePath
 */

function queryData(analytics) {
      analytics.data.realtime.get({
        'auth': jwtClient,
        'ids': 'ga:78449289',
        'metrics': 'rt:activeUsers',
        'dimensions': 'rt:longitude,rt:latitude'
      }, function (err, response) {
        if (err) {
          console.log(err);
          return;
        }
        jsonfile.writeFile(path.resolve(__dirname,'/public/data/realtime.json'), response, {spaces: 2},function (err) {
          if(err) console.error(err)
        })
      });  
    }

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

  queryAllRealtime(analytics,reports);
  //queryData(analytics)

});
