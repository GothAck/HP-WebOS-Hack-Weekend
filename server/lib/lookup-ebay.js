// Any requires here

var http = require ('http');
var querystring = require('querystring');

function search (term, callback, location) {
  var postcode = null;
  if (typeof location === "object") {
    var results = [];
    reverse_geocode(location.lat, location.lon, function (status, data) {
      ebay_search(data);
    });
  } else
    ebay_search();

  function ebay_search(postcode) {
    http.get(
      {
        host: 'svcs.ebay.com',
        port: 80,
        path: api_call_url(term, 3, postcode)
      },
      function (response) {
        var data = '';
        response.on('data', function (chunk) { data += chunk })
        response.on('end', function () {
          // process data here
          var myResultObjects = JSON.parse(data);
          try {
            console.log ('Trying result');
            myResultObjects = myResultObjects.findItemsByKeywordsResponse[0].searchResult[0].item;
            callback(false, myResultObjects);
          } catch (err) {
            try {
              var error_code = myResultObjects.findItemsByKeywordsResponse[0].errorMessage[0].error[0].errorId[0];
              console.log ('Location ERROR caught, trying global');
              if (error_code == "18") {
                return search(term, callback);
              } else
                callback(true, ['JSON Error']);
            } catch (e) {
              callback(true, ['JSON Error'])
            }
          }
        });
      }).on('error', function (error) {
        callback(true, ['HTTP Error']);
      });
    }
}

// Makes keyword search url using given paramater string
function api_call_url(keywords, results, postcode) {
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
  if (typeof postcode !== 'undefined') { apicall += "&buyerPostalCode="+postcode+
    "&itemFilter(0).name=LocalSearchOnly" +
    "&itemFilter(0).value=false" +
    "&itemFilter(1).name=MaxDistance" +
    "&itemFilter(1).value=100";
  }
  return apicall;
}

function reverse_geocode(lat, lng, callback) {
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
          console.log("address", address);
          address = address.split(",");
          address = address[address.length-2].split(" ");
          postcode = address[address.length-2]+'+'+address[address.length-1];
          regex = /[a-z0-9]+\w[0-9]+[a-z]+/i;
          if (!regex.exec(postcode))
            postcode += 'AA';
          callback(false, postcode);
        } catch (err) {
          callback(true);
        }
      } 
    });
  });
}

exports.search = search;
