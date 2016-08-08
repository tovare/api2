'use strict';

var express = require('express');
var navno = express.Router()


var d3 = require('d3');

//
// LokiJS is a high-performance in-memory document database which prioritise performance over anything.
//

var loki = require('lokijs');
var db = new loki("public/data/rtdb.json", {
    'autoload' : true,
    'autosave' : true,
    'verbose' : true  });
var rtdb = db.addCollection("rss");



d3.interval( function() { 
  // Update RSS FEED
}, 7000)
  


navno.get('/navno', function(req, res) {
  var rtusers = rtdb.findOne( { 'name': 'brukere-realtime' })
  console.log("Request rtusers");
})


module.exports = navno