var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var mongo = require('./mongo.js');

app.use('/', express.static(path.join(__dirname, 'public')));

/*  Following MongoDB's suggested practice for connection pooling:
    - create DB connection during startup
    - put app.listen after DB connection is established
    http://blog.mlab.com/2013/11/deep-dive-into-connection-pooling */
mongo.initDB().then(function(db) {
  console.log('Connection to database successfully established');
  app.listen(port, function(err, res) {
    if (err) {
      console.log('Error happened during server startup:', err);
    }
    else {
      console.log('Server started successfully');
    }
  });
}, function(err) {
  console.log('Connection to database could not be established', err);
});