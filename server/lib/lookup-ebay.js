// Any requires here

var http = require ('http');
var querystring = require('querystring');

function search (term, callback) {
  http.get(
    {
      host: 'svcs.ebay.com',
      port: 80,
      path: api_call_url(term, 3)
    },
    function (response) {
      var data = '';
      response.on('data', function (chunk) { data += chunk })
      response.on('end', function () {
        // process data here
        var myResultObjects = JSON.parse(data);
        try {
          myResultObjects = myResultObjects.findItemsByKeywordsResponse[0].searchResult[0].item;
          callback(false, myResultObjects);
        } catch (err) {
          callback(true, ['JSON Error'])
        }
      });
    }).on('error', function (error) {
      callback(true, ['HTTP Error']);
    });
}

// Makes keyword search url using given paramater string
function api_call_url(keywords, results) {
  var base_url = "/services/search/FindingService/v1?";
  var appid = "GMackeld-40b4-41b0-8799-c897cec58896"; 
  var apicall = base_url + querystring.stringify({
    "OPERATION-NAME": "findItemsByKeywords",
    "SERVICE-VERSION":  "1.0.0",
    "SECURITY-APPNAME": appid,
    "GLOBAL-ID":  "EBAY-GB",
    "RESPONSE-DATA-FORMAT": "JSON",
    "keywords": keywords,
    "paginationInput.entriesPerPage": results
  }) + "&REST-PAYLOAD";
  reverse_geocode(0,0);
  return apicall;
}

function reverse_geocode(lat, lng) {
  var path = "/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=false";

  http.get({
    host: "maps.googleapis.com",
    port: 80,
    path: path 
  }, function (response) {
    var data = '';
    response.on('data', function (chunk) { data += chunk })
    response.on('end', function () {
      // process data here
      var results = JSON.parse(data);
      if (results.status == "OK") {
        try {
          var address = results.results[0].formatted_address;
          address = address.split(",")[1].split(" ");
          address = address[2]+address[3];
          console.log("address", address);
        } catch (err) {
          console.log("Error:", err);
        }
      }
    });
  });
}

exports.search = search;
