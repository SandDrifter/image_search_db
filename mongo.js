var mongo = require('mongodb').MongoClient;
var dbPath = process.env.MONGOLAB_URI_IMAGE_SEARCH;
var connectedDB = null;
var connectedColls = {};

module.exports = {
  'initDB': initDB,
  'getDB': getDB,
  'getColl': getColl
}

function initDB() {
  var promise = new Promise(function(resolve, reject) {
    if (connectedDB === null) {
      console.log('Initial retrieval of DB');
      mongo.connect(dbPath).then(function(db) {
        resolve(db);
      }, function(err) {
        reject(err);
      });
    }
    else {
      console.log('Reusing already established DB connection');
      resolve(connectedDB);
    }
  });
  return promise;
}

function getDB() {
  var promise = new Promise(function(resolve, reject) {
    if (connectedDB !== null) {
      resolve(connectedDB);
    }
    else {
      initDB().then(function(db) {
        resolve(db);
      }, function(err) {
        reject(err);
      });
    }
  });
  return promise;
}

function getColl(coll) {
  var promise = new Promise(function(resolve, reject) {
    if (connectedColls[coll]) {
      console.log('Reusing collection ' + coll);
      resolve(connectedColls[coll]);
    }
    else {
      console.log('Initial retrieval of collection ' + coll);
      getDB().then(function(db) {
        // Collection function only works with callback, not with promise
        db.collection(coll, function(err, result) {
          if (err !== null) {
            reject(err);
          }
          else {
            connectedColls[coll] = result;
            resolve(connectedColls[coll]);
          }
        });
      });
    }
  });
  return promise;
}