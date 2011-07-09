// Any requires here

var http = require ('http');

function search (term, callback) {
  http.get(
    {
      host: 'localhost',
      port: 80,
      path: '/'
    },
    function (response) {
      var data = '';
      response.on('data', function (chunk) { data += chunk })
      response.on('end', function () {
        //process data here
        //var object = JSON.parse (data);
        var myResultObjects = [];
        callback(false, myResultObjects) //If there is an error, callback with true as first value and data = error string
      });
    }).on('error', function (error) {
      callback(true, 'HTTP Error');
    });
}

exports.search = search;
