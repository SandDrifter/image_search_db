var https = require('https');
var config = require("./config");
var apiKey = config.apiKey.bingImageSearch;
var apiHost = 'api.cognitive.microsoft.com';
var apiPath = '/bing/v5.0/images/search[?q][&offset]&count=10';

module.exports = {
  'getImages': getImages
}

function getImages(srchString, offset) {
  var promise = new Promise(function (resolve, reject) {
    srchString = encodeURIComponent(srchString);
    var images = "";
    var path = apiPath.replace('[?q]', '?q=' + srchString);
    path = path.replace('[&offset]', '&offset=' + offset);
    https.get({
      host: apiHost,
      path: path,
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(data) {
        images += data;
      });
      res.on('end', function() {
        images = JSON.parse(images).value;
        if (images.length > 1 && images!="undefined") {
          resolve(filterImageInfo(images));
        }
        else {
          reject({'Error': 'No images found for search string ' + srchString});
        }
      });
      res.on('error', function(err) {
        reject({'Error': 'Error happened while transferring results for your search term. Please try again.'});
      });
    }).on('error', function(err) {
      reject({'Error': 'Error happened while requesting images for your search term. Please try again.'});
    });
  });
  return promise;
}

function filterImageInfo(images) {
  var results = [];
  for (var i = 1; i < images.length; i++) {
    var result = {};
    var imageUrlStart = images[i]['contentUrl'].search('&r=') + 3;
    var imageUrlEnd = images[i]['contentUrl'].search('&p=');
    var hostPageUrlStart = images[i]['hostPageUrl'].search('&r=') + 3;
    var hostPageUrlEnd = images[i]['hostPageUrl'].search('&p=');
    result['imageUrl'] =  decodeURIComponent(images[i]['contentUrl'].substring(imageUrlStart, imageUrlEnd));
    result['hostPageUrl'] = decodeURIComponent(images[i]['hostPageUrl'].substring(hostPageUrlStart, hostPageUrlEnd));
    result['altText'] = images[i]['name'];
    results.push(result);
  }
  return results;
}