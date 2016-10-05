var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var dotenv = require('dotenv').config();
var mongo = require('./mongo.js');
var imageSearch = require('./image-search');

app.use('/', express.static(path.join(__dirname, 'public')));

mongo.initDB()
.then(function(db) {
  console.log('Connection to database successfully established');
  app.listen(port, function(err, res) {
    if (err) {
      console.log('Error happened during server startup:', err);
    }
    else {
      console.log('Server started successfully');
    }
  });
},
function(err) {
  console.log('Connection to database could not be established', err);
});

app.get('/search/:srchString', function(req, res) {
  var srchString = req.params.srchString;
  var srchOffset = req.query.offset || 0;
  if (/^[0-9]+$/.test(srchOffset) === false) {
    srchOffset = 0;
  }
  if (/^[a-zA-Z0-9 ]+$/.test(srchString)) {
    imageSearch.getImages(srchString, srchOffset)
    .then(function (results) {
      mongo.getColl('imageSearchHistory')
      .then(function(coll) {
        coll.insertOne({
          'searchTerm': srchString,
          'searchTime': Date.now()
        });
      });
      res.json(results);
    },
    function(error) {
      res.json(error);
    });
  }
  else {
    res.json({"Error": "Invalid search term. Only alhpanumeric characters and spaces allowed"});
  }
});